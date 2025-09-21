/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

// Extend the global Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveValue(value: string | number): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toHaveDisplayValue(value: string | string[]): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveFocus(): R;
    }
  }
}