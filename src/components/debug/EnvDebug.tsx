import React from 'react';

export const EnvDebug: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-gray-900 mb-2">Environment Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>VITE_SUPABASE_URL:</strong>
          <div className="font-mono text-xs break-all bg-gray-100 p-1 rounded">
            {supabaseUrl || 'NOT SET'}
          </div>
        </div>
        <div>
          <strong>VITE_SUPABASE_ANON_KEY:</strong>
          <div className="font-mono text-xs break-all bg-gray-100 p-1 rounded">
            {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <strong>URL Format Check:</strong>
          <div>
            ✓ Should start with: https://
            <br />
            ✓ Should end with: .supabase.co
            <br />
            ✓ Current valid: {supabaseUrl?.startsWith('https://') && supabaseUrl?.endsWith('.supabase.co') ? '✅' : '❌'}
          </div>
        </div>
        <div className="text-xs text-gray-600">
          <strong>Key Format Check:</strong>
          <div>
            ✓ Should start with: eyJ
            <br />
            ✓ Current valid: {supabaseAnonKey?.startsWith('eyJ') ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};