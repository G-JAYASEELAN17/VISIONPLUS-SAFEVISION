import { Component } from 'react'

// Catches render-time errors anywhere below it in the tree so a single
// broken page (e.g. a bad API response shape) can't blank the whole app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Centralized place to wire real error reporting (Sentry, etc.) later.
    console.error('VisionPlus UI error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-slate-200">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-400">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
