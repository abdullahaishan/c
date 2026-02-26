import React, { useEffect, useState } from "react";

const DebugPortfolioState = ({
  username,
  publicLoading,
  publicError,
  developer
}) => {
  const [consoleErrors, setConsoleErrors] = useState([]);

  useEffect(() => {
    const originalError = console.error;

    console.error = (...args) => {
      setConsoleErrors(prev => [...prev, args.join(" ")]);
      originalError(...args);
    };

    window.onerror = function (message, source, lineno, colno, error) {
      setConsoleErrors(prev => [
        ...prev,
        `${message} at ${lineno}:${colno}`
      ]);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-mono text-sm overflow-auto">
      <h1 className="text-xl mb-4 text-white">Portfolio Debug Panel</h1>

      <div className="mb-4">
        <strong>Username:</strong>
        <pre>{JSON.stringify(username, null, 2)}</pre>
      </div>

      <div className="mb-4">
        <strong>Loading:</strong>
        <pre>{JSON.stringify(publicLoading, null, 2)}</pre>
      </div>

      <div className="mb-4">
        <strong>Error:</strong>
        <pre>{JSON.stringify(publicError, null, 2)}</pre>
      </div>

      <div className="mb-4">
        <strong>Developer Data:</strong>
        <pre>
          {developer
            ? JSON.stringify(developer, null, 2)
            : "No developer loaded"}
        </pre>
      </div>

      <div className="mb-4">
        <strong>Console Errors:</strong>
        <pre>
          {consoleErrors.length > 0
            ? consoleErrors.join("\n\n")
            : "No console errors"}
        </pre>
      </div>
    </div>
  );
};

export default DebugPortfolioState;
