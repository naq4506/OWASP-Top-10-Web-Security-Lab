"""
A10:2021 - Server-Side Request Forgery (SSRF) Lab
====================================================

Scenario: "Tech Blog Reader"

The frontend posts a `blog` field to this endpoint. The server either:
  • Returns a predefined blog post  (if value is a known filename like blog1.txt)
  • Makes a REAL outbound HTTP request  (if value looks like a URL)
  • Reads a local file directly        (if value is a file:// URI)

THE VULNERABILITY: no allow-list, no scheme check, no destination validation.
An attacker can supply any URL — internal metadata services, localhost admin
panels, cloud provider IMDS endpoints, or local file paths — and the server
fetches/reads it on their behalf, returning the response directly to the browser.
"""

import base64
import os
import requests as http_client
from flask import Blueprint, request, jsonify
from urllib.parse import urlparse

a10_ssrf_bp = Blueprint('a10_ssrf', __name__)

# ──────────────────────────────────────────────────────────────────────────
# Legitimate blog content (served by filename)
# ──────────────────────────────────────────────────────────────────────────
BLOG_POSTS = {
    'blog1.txt': {
        'title': 'Introduction to Cloud Security',
        'content': (
            'Cloud security is a shared responsibility between the provider and the customer. '
            'While hyperscalers like AWS, Azure, and GCP invest billions every year in securing '
            'the underlying physical infrastructure — data-center perimeters, host hardware, '
            'hypervisors, and the global backbone network — the customer is solely accountable '
            'for everything they build on top of that foundation.\n\n'

            'This "shared responsibility model" is not marketing language; it has direct legal '
            'and operational consequences. If you misconfigure an S3 bucket and expose sensitive '
            'customer records, AWS is not liable — you are. The provider secures the cloud; '
            'you secure what you put in the cloud.\n\n'

            'Identity and Access Management (IAM) is the first pillar of cloud security. '
            'Every principal — human user, service account, or machine role — should follow '
            'the principle of least privilege: grant only the permissions required to perform '
            'the task, nothing more. Over-permissive IAM roles are one of the most common '
            'entry points attackers exploit once they gain an initial foothold.\n\n'

            'Network isolation is the second pillar. Virtual Private Clouds (VPCs), security '
            'groups, and network ACLs define what can talk to what. A compute instance that '
            'serves public web traffic should never sit in the same subnet — or share the '
            'same security group rules — as your database tier. Segmentation limits the blast '
            'radius of any single compromise.\n\n'

            'Encryption at rest and in transit is non-negotiable. Use TLS 1.2 or higher for '
            'all data in motion. Enable server-side encryption (SSE) on every storage resource. '
            'Manage keys through a dedicated service (AWS KMS, Azure Key Vault, GCP Cloud KMS) '
            'so that key material never touches application code or environment variables.\n\n'

            'Continuous posture management closes the loop. Tools like AWS Config, Azure Policy, '
            'and GCP Security Command Center continuously evaluate your deployed resources '
            'against a set of rules and flag drift the moment it occurs. Pair these with a '
            'SIEM platform to correlate signals across accounts and detect threats early.\n\n'

            'Zero-trust architecture extends these ideas to their logical conclusion: assume '
            'breach at all times. Every request — even from inside the perimeter — must be '
            'authenticated, authorized, and encrypted. Micro-segmentation ensures that a '
            'compromised workload cannot pivot laterally through the environment.'
        ),
    },

    'blog2.txt': {
        'title': 'Understanding REST APIs',
        'content': (
            'REST — Representational State Transfer — is an architectural style for distributed '
            'hypermedia systems, first described by Roy Fielding in his 2000 doctoral dissertation. '
            'It is not a protocol, not a standard, and not a library. It is a set of six '
            'constraints that, when followed together, produce systems that are scalable, '
            'loosely coupled, and easy to evolve independently.\n\n'

            'The six constraints are: (1) client-server separation, (2) statelessness, '
            '(3) cacheability, (4) uniform interface, (5) layered system, and (6) code-on-demand '
            '(optional). Most of what developers call "REST" in practice focuses on constraints '
            '2 and 4 — statelessness and the uniform interface.\n\n'

            'Statelessness is REST\'s scalability superpower. Each HTTP request must contain '
            'all information the server needs to process it. The server holds no session state '
            'between requests. This means any node behind a load balancer can serve any request '
            'without coordination — horizontal scaling becomes trivial.\n\n'

            'HTTP verbs carry semantic meaning that API designers should respect. GET is safe '
            'and idempotent — calling it any number of times has no side effects. PUT and DELETE '
            'are idempotent — the second call has no additional effect beyond the first. POST is '
            'neither safe nor idempotent — each call may create a new resource. PATCH performs '
            'a partial update without requiring the full resource representation.\n\n'

            'Status codes communicate outcome without requiring clients to parse the body. '
            '2xx signals success (200 OK, 201 Created, 204 No Content). 4xx signals a client '
            'error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, '
            '429 Too Many Requests). 5xx signals a server error. Using these correctly allows '
            'generic HTTP clients, proxies, and monitoring tools to understand your API.\n\n'

            'Versioning strategy matters enormously as APIs evolve. URI versioning (/v1/, /v2/) '
            'is explicit and easy to route. Header-based versioning keeps URIs clean but is '
            'harder to test in a browser. Whichever strategy you choose, establish a deprecation '
            'policy before you ship v1 — communicate sunset dates, return Deprecation and Sunset '
            'headers in responses, and honour your commitments. Silent breaking changes are the '
            'fastest way to lose API consumer trust.'
        ),
    },

    'blog3.txt': {
        'title': 'Microservices Architecture 101',
        'content': (
            'Microservices architecture decomposes a monolithic application into a collection '
            'of small, independently deployable services, each owning a bounded domain context '
            '— orders, inventory, payments, notifications — and exposing a well-defined API '
            'contract to the rest of the system.\n\n'

            'The organizational benefits align with Conway\'s Law: systems reflect the '
            'communication structures of the organizations that build them. A small, autonomous '
            'team owns a service end-to-end — design, implementation, testing, deployment, and '
            'on-call. This eliminates coordination overhead and enables independent release cadences.\n\n'

            'Every internal call is now a network call. You inherit the full complexity of '
            'distributed systems: latency, partial failure, message ordering, and serialization '
            'overhead must all be accounted for. Circuit breakers prevent a slow upstream from '
            'exhausting connection pools. Retry logic must be implemented carefully — naive '
            'retries amplify load on an already-struggling service.\n\n'

            'Observability becomes the primary debugging primitive. Distributed tracing (Jaeger, '
            'Zipkin, AWS X-Ray) propagates a trace context across service boundaries. Structured '
            'logging with a correlation ID, centralized in a log aggregation platform, lets you '
            'filter across thousands of service instances. Metrics provide the RED signals '
            '— Rate, Errors, Duration — for every service.\n\n'

            'Service meshes (Istio, Linkerd, Consul Connect) address cross-cutting concerns at '
            'the infrastructure layer — mutual TLS between services, traffic shaping, retries, '
            'circuit breaking — without requiring changes to application code.\n\n'

            'From a security perspective the attack surface expands with every new service '
            'boundary. East-west traffic between services is often trusted implicitly — a '
            'dangerous assumption. Enforce authentication on all internal APIs using short-lived '
            'tokens. Apply network policies that allowlist only the communication paths your '
            'architecture actually requires. Log all inter-service calls and alert on anomalies.'
        ),
    },

    'blog4.txt': {
        'title': 'DevOps Best Practices',
        'content': (
            'DevOps is fundamentally a culture shift before it is a toolchain. Breaking down '
            'silos between development and operations enables faster feedback loops, shared '
            'ownership of reliability, and a system that continuously improves rather than '
            'accumulates technical debt.\n\n'

            'Continuous Integration (CI) validates every commit automatically: compilation, '
            'unit tests, integration tests, static analysis, and dependency vulnerability scans '
            'all run within minutes of a merge. The fast feedback loop means regressions are '
            'caught within hours of introduction, not weeks later at a release gate.\n\n'

            'Continuous Delivery (CD) extends the pipeline to produce a deployable artifact '
            'from every green build and automates its promotion through environments. The key '
            'distinction: Continuous Delivery means the artifact can be released with a single '
            'human approval; Continuous Deployment removes even that gate.\n\n'

            'Infrastructure as Code (IaC) with Terraform, Pulumi, or CloudFormation brings '
            'the same engineering discipline to infrastructure that CI/CD brings to application '
            'code: version control, peer review, automated plan/apply pipelines, and drift '
            'detection that catches the moment actual state diverges from declared state.\n\n'

            'Feature flags decouple deployment from release. Code ships to production in an '
            'inactive state behind a flag that can be toggled on for a subset of users without '
            'a new deployment — enabling canary releases, A/B testing, and instant rollback.\n\n'

            'DevSecOps integrates security into every pipeline stage: dependency scanning '
            '(Snyk, Dependabot), container image scanning (Trivy, Grype), secrets detection '
            '(GitLeaks, TruffleHog), SAST (Semgrep, CodeQL), and DAST against staging '
            'environments on every release candidate. Security findings become build failures '
            '— not post-release tickets — and mean time to remediate drops dramatically.'
        ),
    },
}


# ──────────────────────────────────────────────────────────────────────────
# Core resolve function — THE VULNERABLE PART
# ──────────────────────────────────────────────────────────────────────────
FETCH_TIMEOUT = 8  # seconds


def _is_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        return parsed.scheme in ('http', 'https') and bool(parsed.netloc)
    except Exception:
        return False


def _is_file_uri(value: str) -> bool:
    return value.startswith('file://')


def _resolve(blog_value: str):
    # ── known blog filename → static response, no network call ──
    if blog_value in BLOG_POSTS:
        return BLOG_POSTS[blog_value], False

    # ── file:// URI → read local file directly (SSRF: local file disclosure) ──
    if _is_file_uri(blog_value):
        # Strip file:// prefix to get the actual path
        # Supports both file:///absolute/path and file://relative/path
        file_path = blog_value[7:]          # remove 'file://'
        if file_path.startswith('/'):
            abs_path = file_path            # absolute: file:///etc/passwd
        else:
            # relative to the current working directory of the Flask process
            abs_path = os.path.join(os.getcwd(), file_path)

        try:
            with open(abs_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            return {
                'title': f'Local File — {abs_path}',
                'content': (
                    f'[Read local file via file:// URI]\n'
                    f'[Path: {abs_path}]\n\n'
                    f'{content}'
                ),
                'is_image': False,
            }, True

        except FileNotFoundError:
            return {
                'title': 'File Not Found',
                'content': f'Could not read: {abs_path}\nFile does not exist.',
            }, True

        except PermissionError:
            return {
                'title': 'Permission Denied',
                'content': f'Could not read: {abs_path}\nInsufficient permissions.',
            }, True

        except IsADirectoryError:
            # List directory contents instead — useful for enumeration
            try:
                entries = os.listdir(abs_path)
                listing = '\n'.join(sorted(entries))
                return {
                    'title': f'Directory Listing — {abs_path}',
                    'content': (
                        f'[Directory listing via file:// URI]\n'
                        f'[Path: {abs_path}]\n\n'
                        f'{listing}'
                    ),
                    'is_image': False,
                }, True
            except Exception as e:
                return {
                    'title': 'Directory Error',
                    'content': f'Could not list directory {abs_path}:\n\n{e}',
                }, True

        except Exception as e:
            return {
                'title': 'File Read Error',
                'content': f'Unexpected error reading {abs_path}:\n\n{e}',
            }, True

    # ── http/https URL → REAL outbound HTTP fetch (the SSRF sink) ──
    if _is_url(blog_value):
        try:
            resp = http_client.get(
                blog_value,
                timeout=FETCH_TIMEOUT,
                allow_redirects=True,
                headers={
                    'User-Agent': 'TechBlogReader/1.0 (internal-fetcher)',
                },
            )
            content_type = resp.headers.get('Content-Type', '')
            size = len(resp.content)
            meta = (
                f'[Fetched by server from: {blog_value}]\n'
                f'[Status: {resp.status_code}  Content-Type: {content_type}]\n'
                f'[Size: {size} bytes]'
            )

            # ── image → base64 so frontend can render <img> ──
            is_image = content_type.split(';')[0].strip().startswith('image/')
            if is_image:
                b64 = base64.b64encode(resp.content).decode('ascii')
                media_type = content_type.split(';')[0].strip()
                return {
                    'title': f'Remote Resource — {resp.status_code} {resp.reason}',
                    'content': meta,
                    'is_image': True,
                    'media_type': media_type,
                    'image_b64': b64,
                }, True

            # ── text / JSON / HTML fallback ──
            try:
                body = resp.content.decode(resp.encoding or 'utf-8', errors='replace')
            except Exception:
                body = resp.text

            return {
                'title': f'Remote Resource — {resp.status_code} {resp.reason}',
                'content': meta + '\n\n' + body,
                'is_image': False,
            }, True

        except http_client.exceptions.ConnectionError as e:
            return {
                'title': 'Connection Error',
                'content': (
                    f'Server attempted to fetch: {blog_value}\n\n'
                    f'Connection failed: {e}\n\n'
                    'This error itself proves SSRF: the server tried to reach an '
                    'arbitrary destination on behalf of the client.'
                ),
            }, True

        except http_client.exceptions.Timeout:
            return {
                'title': 'Request Timed Out',
                'content': (
                    f'Server attempted to fetch: {blog_value}\n\n'
                    f'The request timed out after {FETCH_TIMEOUT}s.\n'
                    'The target may be an internal host that is unreachable from '
                    'this container, but the server still tried.'
                ),
            }, True

        except Exception as e:
            return {
                'title': 'Fetch Error',
                'content': f'Unexpected error while fetching {blog_value}:\n\n{e}',
            }, True

    # ── unrecognised value — neither filename, file URI, nor http(s) URL ──
    return None, False


@a10_ssrf_bp.route('/api/a10/read-blog', methods=['POST'])
def read_blog():
    blog_value = request.form.get('blog', '').strip()
    result, is_exploit = _resolve(blog_value)

    if result is None:
        return jsonify({
            'title': 'Not Found',
            'content': (
                f'Could not resolve resource: "{blog_value}"\n\n'
                'Expected a known blog filename (blog1.txt … blog4.txt), '
                'a full URL (http:// or https://), '
                'or a local file URI (file://.env  or  file:///etc/passwd).'
            ),
            'exploited': False,
            'requested': blog_value,
        }), 404

    payload = {
        'title':      result['title'],
        'content':    result.get('content', ''),
        'exploited':  is_exploit,
        'requested':  blog_value,
        'is_image':   result.get('is_image', False),
        'media_type': result.get('media_type', ''),
        'image_b64':  result.get('image_b64', ''),
    }
    return jsonify(payload)