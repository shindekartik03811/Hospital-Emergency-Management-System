/**
 * Dynamic Doubly Linked List for Patient Record Maintenance
 * Implements node memory simulation, pointer linking (next/prev),
 * dynamic allocation, deletion, traversal, and update operations.
 */

// Memory address generator simulating heap allocation in C/C++ style
function generateMemoryAddress(seed: number | string): string {
  let hash = 0;
  const str = String(seed) + Math.random().toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = (Math.abs(hash) % 0xfffffff).toString(16).toUpperCase().padStart(7, '0');
  return `0x7FF${hex}`;
}

export class ListNode<T> {
  public data: T;
  public next: ListNode<T> | null = null;
  public prev: ListNode<T> | null = null;
  public memoryAddress: string;
  public allocatedAt: number;

  constructor(data: T, addressOverride?: string) {
    this.data = data;
    this.allocatedAt = Date.now();
    this.memoryAddress = addressOverride || generateMemoryAddress((data as unknown as { id?: string })?.id || Date.now());
  }
}

export interface NodeInspectionInfo<T> {
  index: number;
  memoryAddress: string;
  nextAddress: string | null;
  prevAddress: string | null;
  data: T;
}

export class PatientLinkedList<T extends { id: string }> {
  public head: ListNode<T> | null = null;
  public tail: ListNode<T> | null = null;
  public count: number = 0;

  constructor() {}

  /**
   * Append a new node to the end of the linked list (tail)
   * Time complexity: O(1)
   */
  public append(data: T, addressOverride?: string): ListNode<T> {
    const newNode = new ListNode<T>(data, addressOverride);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else if (this.tail) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.count++;
    return newNode;
  }

  /**
   * Prepend a new node to the front of the linked list (head)
   * Time complexity: O(1)
   */
  public prepend(data: T, addressOverride?: string): ListNode<T> {
    const newNode = new ListNode<T>(data, addressOverride);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.count++;
    return newNode;
  }

  /**
   * Find a node by record ID
   * Time complexity: O(n)
   */
  public findNodeById(id: string): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.data.id === id) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Find data by record ID
   */
  public findById(id: string): T | null {
    const node = this.findNodeById(id);
    return node ? node.data : null;
  }

  /**
   * Update a patient record in-place in its dynamic node
   */
  public updateById(id: string, updateFn: (existing: T) => T): boolean {
    const node = this.findNodeById(id);
    if (!node) return false;
    node.data = updateFn({ ...node.data });
    return true;
  }

  /**
   * Delete a node from the linked list by ID
   * Rewires prev.next and next.prev pointers
   * Time complexity: O(n) search, O(1) pointer adjustment
   */
  public deleteById(id: string): boolean {
    const targetNode = this.findNodeById(id);
    if (!targetNode) return false;

    // If target is head
    if (targetNode === this.head) {
      this.head = targetNode.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
    } 
    // If target is tail
    else if (targetNode === this.tail) {
      this.tail = targetNode.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
    } 
    // Middle node
    else {
      if (targetNode.prev) {
        targetNode.prev.next = targetNode.next;
      }
      if (targetNode.next) {
        targetNode.next.prev = targetNode.prev;
      }
    }

    targetNode.next = null;
    targetNode.prev = null;
    this.count--;
    return true;
  }

  /**
   * Traverse the list from Head to Tail and return an array of data
   */
  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Traverse backward from Tail to Head
   */
  public toArrayReversed(): T[] {
    const result: T[] = [];
    let current = this.tail;
    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  /**
   * Export detailed node metadata (addresses, pointers, index) for visualization
   */
  public getNodes(): NodeInspectionInfo<T>[] {
    const nodes: NodeInspectionInfo<T>[] = [];
    let current = this.head;
    let idx = 0;
    while (current) {
      nodes.push({
        index: idx,
        memoryAddress: current.memoryAddress,
        nextAddress: current.next ? current.next.memoryAddress : null,
        prevAddress: current.prev ? current.prev.memoryAddress : null,
        data: current.data,
      });
      current = current.next;
      idx++;
    }
    return nodes;
  }

  /**
   * Search through linked list with query predicate
   */
  public search(query: string, matchFn: (item: T, q: string) => boolean): T[] {
    const matched: T[] = [];
    let current = this.head;
    const cleanQuery = query.toLowerCase().trim();
    while (current) {
      if (matchFn(current.data, cleanQuery)) {
        matched.push(current.data);
      }
      current = current.next;
    }
    return matched;
  }

  public size(): number {
    return this.count;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  /**
   * Rehydrate from an array of records (e.g. from localStorage or initial data)
   */
  public static fromArray<U extends { id: string }>(items: U[]): PatientLinkedList<U> {
    const list = new PatientLinkedList<U>();
    for (const item of items) {
      list.append(item);
    }
    return list;
  }
}
