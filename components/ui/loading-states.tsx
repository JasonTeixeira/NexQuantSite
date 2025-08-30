import { Skeleton } from "./loading-skeleton"
import { Card, CardContent, CardHeader } from "./card"

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[80px]" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[120px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[60px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-4 gap-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-[100px]" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 py-2">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 w-[80px]" />
        ))}
      </div>
    ))}
  </div>
)

export const ChartSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-[150px]" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-8 w-[60px]" />
      </div>
    </div>
    <Skeleton className="h-[400px] w-full" />
    <div className="flex justify-center space-x-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-3 w-[40px] mb-1" />
          <Skeleton className="h-2 w-[30px]" />
        </div>
      ))}
    </div>
  </div>
)

export const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-[150px]" />
      <Skeleton className="h-4 w-[200px]" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </CardContent>
  </Card>
)
