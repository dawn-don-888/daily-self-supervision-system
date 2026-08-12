// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { RefreshCw, TrendingUp, PieChart, Clock } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useRecordData } from '@/hooks/use-example';

// export default function ExamplePage() {
//   const { record, loading, error, refetch } = useRecordData();
//   const [dimension, setDimension] = useState<'month' | 'quarter' | 'year'>('month');

//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <div className="text-muted-foreground">加载中...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-64 flex-col items-center justify-center space-y-4">
//         <div className="text-destructive">{error}</div>
//         <Button onClick={refetch} variant="outline" size="sm">
//           <RefreshCw className="mr-2 h-4 w-4" />
//           重试
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* 页面内容 */}
//     </div>
//   );
// }
