# UI Component Library

Reusable UI components for the Mental Math Trainer application. All components support dark mode and follow accessibility best practices.

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

// Primary button (default)
<Button onClick={handleClick}>Click me</Button>

// Different variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Card

Container component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <h2 className="text-xl font-bold">Card Title</h2>
    <p className="text-muted-foreground">Card subtitle</p>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="default">...</Card>
<Card variant="elevated">...</Card>
<Card variant="outlined">...</Card>
```

### Input

Form input component with label, helper text, and error states.

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  type="number"
  placeholder="Enter number"
  value={value}
  onChange={handleChange}
/>

// With label
<Input
  label="Your Answer"
  type="number"
  placeholder="Enter answer"
/>

// With helper text
<Input
  label="Number"
  helperText="Enter a number between 1 and 100"
  type="number"
/>

// Error state
<Input
  label="Your Answer"
  error="Answer is incorrect"
  hasError
  type="number"
/>

// Large variant (for main problem input)
<Input
  variant="large"
  type="number"
  placeholder="?"
/>
```

### Badge

Small badge/tag component for status indicators and labels.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="success">Correct</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Incorrect</Badge>
<Badge variant="info">Beginner</Badge>
```

### Progress

Progress bar component for displaying completion percentage.

```tsx
import { Progress } from '@/components/ui';

// Basic progress
<Progress value={75} />

// With percentage display
<Progress value={50} showPercentage />

// With label
<Progress value={30} label="Session Progress" />

// Both label and percentage
<Progress
  value={85}
  label="Overall Accuracy"
  showPercentage
/>
```

### Select

Select/dropdown component with label and error states.

```tsx
import { Select } from '@/components/ui';

const options = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert', disabled: true }
];

<Select
  label="Difficulty Level"
  placeholder="Select difficulty"
  options={options}
  value={selectedValue}
  onChange={handleChange}
/>

// With helper text
<Select
  label="Method"
  helperText="Choose a calculation method"
  options={methodOptions}
/>

// With error
<Select
  label="Difficulty"
  error="Please select a difficulty level"
  hasError
  options={options}
/>
```

## Features

All components include:

- **TypeScript Support**: Full type definitions with JSDoc comments
- **Dark Mode**: Automatic support using CSS variables
- **Accessibility**: ARIA attributes, keyboard navigation, focus states
- **Responsive**: Mobile-friendly design
- **Customizable**: Accept className prop for additional styling
- **React.forwardRef**: Support ref forwarding for advanced use cases

## CSS Variables

Components use these CSS variables from `globals.css`:

```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--accent, --accent-foreground
--success, --warning, --error
--muted, --muted-foreground
--border, --ring
--card, --card-foreground
```

Dark mode is automatically applied via `@media (prefers-color-scheme: dark)`.

## Customization

All components accept a `className` prop for additional Tailwind CSS classes:

```tsx
<Button className="w-full mt-4">Full Width Button</Button>
<Card className="max-w-md mx-auto">Centered Card</Card>
<Input className="font-mono" />
```

## Accessibility

Components follow WAI-ARIA best practices:

- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- Form controls with proper labels
