/**
 * UI Component Examples
 *
 * This file demonstrates all UI components in action.
 * It can be used as a visual reference or component showcase.
 */

import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Progress,
  Select
} from './index';

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Button Examples</h2>

      <div className="flex gap-2 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button loading>Loading...</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}

export function CardExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Card Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default">
          <CardHeader>
            <h3 className="text-lg font-semibold">Default Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a default card with border.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Elevated Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This card has a shadow effect.
            </p>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-semibold">Outlined Card</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This card has a thicker border.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function InputExamples() {
  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Input Examples</h2>

      <Input
        type="text"
        placeholder="Basic input"
      />

      <Input
        label="Your Name"
        type="text"
        placeholder="Enter your name"
      />

      <Input
        label="Number Input"
        type="number"
        placeholder="Enter a number"
        helperText="This is helper text"
      />

      <Input
        label="Error State"
        type="number"
        error="This field is required"
        hasError
      />

      <Input
        variant="large"
        type="number"
        placeholder="?"
      />
    </div>
  );
}

export function BadgeExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Badge Examples</h2>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="success">Correct</Badge>
        <Badge variant="error">Incorrect</Badge>
        <Badge variant="info">Beginner</Badge>
        <Badge variant="warning">Intermediate</Badge>
      </div>
    </div>
  );
}

export function ProgressExamples() {
  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Progress Examples</h2>

      <Progress value={25} />

      <Progress value={50} showPercentage />

      <Progress value={75} label="Session Progress" />

      <Progress
        value={90}
        label="Overall Accuracy"
        showPercentage
      />
    </div>
  );
}

export function SelectExamples() {
  const difficultyOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Expert', value: 'expert' },
    { label: 'Mastery', value: 'mastery' }
  ];

  const methodOptions = [
    { label: 'Distributive Property', value: 'distributive' },
    { label: 'Near Powers of 10', value: 'near-power-10' },
    { label: 'Difference of Squares', value: 'difference-squares' },
    { label: 'Factorization', value: 'factorization' }
  ];

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Select Examples</h2>

      <Select
        options={difficultyOptions}
        placeholder="Select an option"
      />

      <Select
        label="Difficulty Level"
        options={difficultyOptions}
        placeholder="Choose difficulty"
      />

      <Select
        label="Calculation Method"
        options={methodOptions}
        helperText="Select the method you want to practice"
      />

      <Select
        label="Error State"
        options={difficultyOptions}
        error="Please select a difficulty level"
        hasError
      />
    </div>
  );
}

/**
 * Complete showcase of all components
 */
export default function UIShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">UI Component Library</h1>
        <p className="text-muted-foreground">
          Complete showcase of all reusable components
        </p>
      </div>

      <ButtonExamples />
      <CardExamples />
      <InputExamples />
      <BadgeExamples />
      <ProgressExamples />
      <SelectExamples />

      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold">Complete Example</h3>
          <p className="text-muted-foreground">
            All components working together
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="info">Practice Mode</Badge>
            <Badge variant="success">75% Accuracy</Badge>
          </div>

          <Progress value={75} label="Session Progress" showPercentage />

          <Select
            label="Difficulty"
            options={[
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' }
            ]}
            placeholder="Select difficulty"
          />

          <Input
            label="Your Answer"
            type="number"
            placeholder="Enter answer"
            variant="large"
          />
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Skip</Button>
          <Button variant="primary">Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
