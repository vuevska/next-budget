import React from "react";

const LoadingTransactions = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading transactions...</p>
      </div>
    </div>
  );
};

export default LoadingTransactions;
