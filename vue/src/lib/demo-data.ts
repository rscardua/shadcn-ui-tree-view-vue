import type { TreeViewItem } from '@/components/tree-view/types'

export const demoData: TreeViewItem[] = [
  {
    id: 'science',
    name: 'Science',
    type: 'region',
    children: [
      {
        id: 'physics',
        name: 'Physics',
        type: 'store',
        children: [
          {
            id: 'mechanics',
            name: 'Mechanics',
            type: 'department',
            children: [
              { id: 'newton1', name: "Newton's First Law", type: 'item' },
              { id: 'newton2', name: "Newton's Second Law", type: 'item' },
              { id: 'newton3', name: "Newton's Third Law", type: 'item' },
              { id: 'momentum', name: 'Conservation of Momentum', type: 'item' },
            ],
          },
          {
            id: 'thermo',
            name: 'Thermodynamics',
            type: 'department',
            children: [
              { id: 'thermo1', name: 'First Law of Thermodynamics', type: 'item' },
              { id: 'thermo2', name: 'Second Law of Thermodynamics', type: 'item' },
              { id: 'entropy', name: 'Entropy', type: 'item' },
            ],
          },
        ],
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        type: 'store',
        children: [
          {
            id: 'organic',
            name: 'Organic Chemistry',
            type: 'department',
            children: [
              { id: 'alkanes', name: 'Alkanes', type: 'item' },
              { id: 'alkenes', name: 'Alkenes', type: 'item' },
              { id: 'alcohols', name: 'Alcohols', type: 'item' },
              { id: 'ketones', name: 'Ketones', type: 'item' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'locked',
    name: 'Locked Section (not draggable)',
    type: 'region',
    draggable: false,
    children: [
      { id: 'locked-item-1', name: 'Protected Item 1', type: 'item', draggable: false },
      { id: 'locked-item-2', name: 'Protected Item 2', type: 'item', draggable: false },
    ],
  },
  {
    id: 'readonly-folder',
    name: 'Read-only Folder (no drops inside)',
    type: 'region',
    droppable: false,
    children: [
      { id: 'readonly-item-1', name: 'Existing Item A', type: 'item' },
      { id: 'readonly-item-2', name: 'Existing Item B', type: 'item' },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    type: 'region',
    children: [
      {
        id: 'algebra',
        name: 'Algebra',
        type: 'store',
        children: [
          {
            id: 'linear',
            name: 'Linear Algebra',
            type: 'department',
            children: [
              { id: 'matrices', name: 'Matrices', type: 'item' },
              { id: 'vectors', name: 'Vectors', type: 'item' },
              { id: 'eigen', name: 'Eigenvalues', type: 'item' },
            ],
          },
          {
            id: 'abstract',
            name: 'Abstract Algebra',
            type: 'department',
            children: [
              { id: 'groups', name: 'Group Theory', type: 'item' },
              { id: 'rings', name: 'Ring Theory', type: 'item' },
              { id: 'fields', name: 'Field Theory', type: 'item' },
              { id: 'galois', name: 'Galois Theory', type: 'item' },
            ],
          },
        ],
      },
    ],
  },
]
