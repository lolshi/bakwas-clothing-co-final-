
import { Box } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Box className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
