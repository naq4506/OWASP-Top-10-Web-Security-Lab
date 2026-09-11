def parent(i):
    return i //2
def left(i):
    return 2*i
def right(i):
    return 2*i + 1

def max_heapify(A, i, n):
    l = left(i)
    r = right(i)
 
    max = i

    if l <= n and A[l] > A[max]:
        max = l
    if r <= n and A[r] > A[max]:
        max = r

    if max != i:
        A[i], A[max] = A[max], A[i]
        max_heapify(A, max, n)

def build_max_heap(A, n):
    for i in range(n//2, 0, -1):
        max_heapify(A, i, n)

e