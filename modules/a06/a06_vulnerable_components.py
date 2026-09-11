"""
A06:2021 - Vulnerable and Outdated Components
───────────────────────────────────────────────
Educational lab backend.

IMPORTANT SAFETY NOTE FOR MAINTAINERS:
This module NEVER executes user-supplied code. It always parses YAML
with `yaml.safe_load()`, which is immune to the classic PyYAML
deserialization RCE (`!!python/object/apply:...`, `!!python/object/new:...`,
etc.). When a known-dangerous YAML tag is detected in the raw input
text, the endpoint returns a hard-coded, clearly-labelled SIMULATED
response so the lab can teach "what an attacker would see if this
backend instead called yaml.load()/yaml.unsafe_load()" without ever
actually running subprocess, os.system, or any other command.

Do NOT replace safe_load with load/unsafe_load/full_load "to make the
demo more realistic" — that would turn this teaching lab into a real
remote code execution endpoint.
"""

import re
import yaml
from flask import Blueprint, request, jsonify

a06_vulnerable_components_bp = Blueprint('a06_vulnerable_components', __name__)

# ── Patterns that flag "this YAML would attempt code execution if a
#    vulnerable/outdated loader (yaml.load / yaml.unsafe_load) were used" ──
DANGEROUS_TAG_PATTERNS = [
    r'!!python/object/apply:',
    r'!!python/object/new:',
    r'!!python/object:',
    r'!!python/name:',
    r'!!python/module:',
]

# Fixed, pre-written fake outputs for a handful of recognizable
# "commands" embedded in the apply payload's argument list. These are
# NOT executed — they are looked up by simple keyword match against the
# decoded YAML payload so the lab can show a believable but entirely
# canned result.
SIMULATED_COMMAND_OUTPUTS = {
    'whoami':        'svc_yamlparser',
    'id':             'uid=999(svc_yamlparser) gid=999(svc_yamlparser) groups=999(svc_yamlparser)',
    'pwd':            '/srv/app/backend',
    'hostname':       'lab-a06-prod-01',
    'uname -a':       'Linux lab-a06-prod-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux',
    'ls':             'app.py  requirements.txt  modules/  uploads/  .env',
    'cat /etc/passwd':'root:x:0:0:root:/root:/bin/bash\nsvc_yamlparser:x:999:999::/srv/app:/bin/sh',
    'env':            "DB_PASSWORD=Sup3rSecretDB!2024\nFLASK_SECRET_KEY=dev-7f3a9c\nPATH=/usr/local/bin:/usr/bin:/bin",
}


def _extract_dangerous_tag(raw_text: str):
    """Return the first dangerous YAML tag pattern found in raw input, or None."""
    for pattern in DANGEROUS_TAG_PATTERNS:
        if re.search(pattern, raw_text):
            return pattern.strip(':')
    return None


def _extract_simulated_command(raw_text: str):
    """
    Best-effort, simple keyword lookup against our fixed canned-output
    table. This is purely cosmetic for the simulation — it does not
    parse or evaluate the YAML's arguments in any executable sense.
    """
    lowered = raw_text.lower()
    # Sort by length desc so multi-word commands (e.g. "cat /etc/passwd")
    # are matched before shorter substrings (e.g. "cat").
    for cmd in sorted(SIMULATED_COMMAND_OUTPUTS.keys(), key=len, reverse=True):
        if cmd in lowered:
            return cmd
    return None


@a06_vulnerable_components_bp.route('/api/a06/yaml-to-json', methods=['POST'])
def yaml_to_json():
    """
    Convert uploaded YAML to JSON.

    Always uses yaml.safe_load() — real parsing, real conversion,
    zero code execution risk. If the raw text also contains a known
    dangerous deserialization tag, we additionally return a
    `simulated_exploit` block with a canned "what would have happened"
    payload, clearly marked as simulated.
    """
    data = request.get_json(silent=True) or {}
    raw_yaml = data.get('yaml_content', '')

    if not raw_yaml or not raw_yaml.strip():
        return jsonify({'error': 'No YAML content provided.'}), 400

    if len(raw_yaml) > 20000:
        return jsonify({'error': 'File too large for this lab (max 20KB).'}), 400

    dangerous_tag = _extract_dangerous_tag(raw_yaml)

    # ── Real, safe conversion ────────────────────────────────────────
    try:
        parsed = yaml.safe_load(raw_yaml)
    except yaml.YAMLError as e:
        # safe_load correctly refuses to construct python objects for
        # tags like !!python/object/apply, so this is the branch that
        # actually fires for the lab's example payload. When the raw
        # text contains one of our recognized dangerous tags, we attach
        # a clearly-labelled SIMULATED block here — built from a fixed
        # lookup table, never from executing anything — showing what an
        # attacker would have seen had the backend used the unsafe
        # yaml.load()/yaml.unsafe_load() instead of safe_load().
        response = {
            'error': f'YAML parsing error: {str(e)}',
            'note': (
                'safe_load() rejected this document because it contains '
                'a Python object construction tag. A hardened backend '
                'stops here. This error message is the real, unmodified '
                'PyYAML exception — nothing was executed.'
            ),
            'dangerous_tag_detected': dangerous_tag,
        }

        if dangerous_tag:
            simulated_cmd = _extract_simulated_command(raw_yaml)
            response['simulated_exploit'] = {
                'is_simulated': True,
                'warning': (

                ),
                'simulated_command': simulated_cmd or 'unknown',
                'simulated_output': SIMULATED_COMMAND_OUTPUTS.get(
                    simulated_cmd,
                    '[no canned output for this command in the simulation table]'
                ),
            }

        return jsonify(response), 400

    # ── Normal success path: nothing dangerous, real parsed JSON ──────
    return jsonify({
        'json_result': parsed,
        'dangerous_tag_detected': dangerous_tag,
    }), 200


@a06_vulnerable_components_bp.route('/api/a06/terminal', methods=['POST'])
def fake_terminal():
    """
    Fixed-command fake terminal for the lab UI.

    This endpoint NEVER touches subprocess, os.system, eval, exec, or
    any real shell. It only accepts a short allow-list of command
    strings and returns a pre-written string for each. Anything else
    returns a canned "command not found" message.
    """
    data = request.get_json(silent=True) or {}
    cmd = (data.get('command') or '').strip()

    allowed_responses = {
        'whoami':   SIMULATED_COMMAND_OUTPUTS['whoami'],
        'id':       SIMULATED_COMMAND_OUTPUTS['id'],
        'pwd':      SIMULATED_COMMAND_OUTPUTS['pwd'],
        'hostname': SIMULATED_COMMAND_OUTPUTS['hostname'],
        'uname -a': SIMULATED_COMMAND_OUTPUTS['uname -a'],
        'ls':       SIMULATED_COMMAND_OUTPUTS['ls'],
        'env':      SIMULATED_COMMAND_OUTPUTS['env'],
        'help':     'Available simulated commands: whoami, id, pwd, hostname, uname -a, ls, env, clear',
    }

    if cmd.lower() in allowed_responses:
        return jsonify({'output': allowed_responses[cmd.lower()], 'is_simulated': True}), 200

    return jsonify({
        'output': f'bash: {cmd}: command not found (simulated terminal — only a fixed command set is available)',
        'is_simulated': True,
    }), 200