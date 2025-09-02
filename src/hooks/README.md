# useClickOutside Hook

A reusable React hook for detecting clicks outside of specified elements with advanced configuration options.

## Features

- ✅ **Basic click outside detection**
- ✅ **Exclude specific elements** from triggering the callback
- ✅ **Mobile-only mode** for responsive behavior
- ✅ **Conditional activation** with enabled/disabled state
- ✅ **TypeScript support** with proper typing
- ✅ **Automatic cleanup** of event listeners

## Usage

### Basic Example

```tsx
import React, { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, {
    onClickOutside: () => setIsOpen(false),
    enabled: isOpen
  });

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && (
        <div ref={dropdownRef} className="dropdown">
          Dropdown content
        </div>
      )}
    </div>
  );
};
```

### With Exclusions

```tsx
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(dropdownRef, {
    onClickOutside: () => setIsOpen(false),
    excludeRefs: [buttonRef], // Don't close when clicking button
    enabled: isOpen
  });

  return (
    <div>
      <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {isOpen && (
        <div ref={dropdownRef} className="dropdown">
          Dropdown content
        </div>
      )}
    </div>
  );
};
```

### Mobile Only

```tsx
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, {
    onClickOutside: () => setIsOpen(false),
    mobileOnly: true, // Only close on mobile devices
    enabled: isOpen
  });

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <div ref={modalRef} className="modal">
          Modal content
        </div>
      )}
    </>
  );
};
```

## API Reference

### Parameters

- `ref: RefObject<HTMLElement | null>` - Reference to the element to monitor
- `options: UseClickOutsideOptions` - Configuration options

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onClickOutside` | `() => void` | **Required** | Callback function to execute when clicking outside |
| `excludeRefs` | `RefObject<HTMLElement \| null>[]` | `[]` | Array of refs to exclude from detection |
| `mobileOnly` | `boolean` | `false` | Whether to only trigger on mobile devices (≤768px) |
| `enabled` | `boolean` | `true` | Whether the hook is currently active |

## Use Cases

- **Dropdowns**: Close when clicking outside
- **Modals**: Close when clicking overlay
- **Tooltips**: Hide when clicking elsewhere
- **Context menus**: Close when clicking outside
- **Mobile navigation**: Close sidebar when clicking outside
- **Search suggestions**: Hide when clicking elsewhere

## Implementation Details

The hook uses `mousedown` events for better cross-browser compatibility and handles:

- **Event delegation**: Single event listener on document
- **Ref validation**: Checks if refs exist before using them
- **Cleanup**: Automatically removes event listeners
- **Performance**: Only active when enabled
- **Responsive**: Optional mobile-only behavior

## Examples in Codebase

- **Room component**: Closes members panel on mobile when clicking outside
- **Settings dropdowns**: Close when clicking elsewhere
- **Admin modals**: Close when clicking overlay

## Best Practices

1. **Always enable/disable** the hook based on component state
2. **Use excludeRefs** for interactive elements that shouldn't trigger close
3. **Consider mobile-only** for responsive components
4. **Clean up refs** when components unmount
5. **Test edge cases** like rapid clicking and touch events
