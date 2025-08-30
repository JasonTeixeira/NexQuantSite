import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveStyle(style: string | Record<string, any>): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeEmptyDOMElement(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(htmlText: string): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toHaveFormValues(expectedValues: Record<string, any>): R
      toHaveProperty(property: string, value?: any): R
      toBePartiallyChecked(): R
      toHaveErrorMessage(text: string | RegExp): R
      toHaveDescription(text: string | RegExp): R
      toHaveAccessibleName(text: string | RegExp): R
      toHaveAccessibleDescription(text: string | RegExp): R
      // Custom matchers
      toBeValidPrice(value?: number): R
      toBeValidPercentage(value?: number): R
    }
  }
}
