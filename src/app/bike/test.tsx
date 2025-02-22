// app/bike/context-test.tsx
'use client';

import { Form, useFormContext } from '@/components/ui/form'; // Import Form and useFormContext
import { Button } from '@/components/ui/button';

interface TestFormContextValues {
  testValue: string;
}

const TestChildComponent = () => {
  const formContext = useFormContext<TestFormContextValues>(); // Use useFormContext

  if (!formContext) {
    return <p>Form context is NOT available!</p>; // Check if context is available
  }

  return (
    <div>
      <p>Form context IS available!</p>
      <pre>{JSON.stringify(formContext, null, 2)}</pre> {/* Display context value */}
    </div>
  );
};


export default function ContextTestPage() {
  return (
    <Form> {/* Wrap with Form provider */}
      <form>
        <h1>Context Test Page</h1>
        <TestChildComponent /> <
        Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
