import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye, RefreshCw, CheckCircle, XCircle, AlertTriangle, Search, Package, Truck, CheckSquare, MoreVertical, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  return_picked: 'bg-blue-500/20 text-blue-400',
  return_received: 'bg-purple-500/20 text-purple-400',
  return_complete: 'bg-emerald-500/20 text-emerald-400',
};

const AdminReturns = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnItemsLoading, setReturnItemsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    picked: 0,
    received: 0,
    completed: 0,
  });
  const [showOverrideDialog, setShowOverrideDialog] = useState<null | 'approve' | 'reject'>(null);
  const [overrideKey, setOverrideKey] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const overrideInputRef = useRef<HTMLInputElement>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completeKey, setCompleteKey] = useState('');
  const [refundPercent, setRefundPercent] = useState(100);
  const [completeError, setCompleteError] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeTargetReturn, setCompleteTargetReturn] = useState<any | null>(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    setError(null);
    try {
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
        .select(`
          *,
          orders (
            order_number,
            customer_name,
            customer_email,
            customer_phone,
            total_amount,
            order_items (
              id,
              quantity
            )
          ),
          return_item_details (
            id,
            order_item_id,
            quantity
          )
        `)
      .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      setReturns(returnsData || []);
      
      // Calculate stats
      const stats = {
        total: returnsData.length,
        pending: returnsData.filter(r => r.status === 'pending').length,
        approved: returnsData.filter(r => r.status === 'approved').length,
        rejected: returnsData.filter(r => r.status === 'rejected').length,
        picked: returnsData.filter(r => r.status === 'return_picked').length,
        received: returnsData.filter(r => r.status === 'return_received').length,
        completed: returnsData.filter(r => r.status === 'return_complete').length,
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError('Failed to fetch returns');
      setReturns([]);
    } finally {
    setLoading(false);
    }
  };

  const fetchReturnItems = async (returnId: string) => {
      setReturnItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_item_details')
        .select(`
          *,
          order_items (
            product_name,
            product_image,
            unit_price,
            quantity
          )
        `)
        .eq('return_id', returnId);

      if (error) throw error;
      setReturnItems(data || []);
    } catch (err) {
      console.error('Error fetching return items:', err);
      toast.error('Failed to fetch return items');
        setReturnItems([]);
    } finally {
      setReturnItemsLoading(false);
    }
  };

  const handleViewReturn = async (returnItem: any) => {
    setSelectedReturn(returnItem);
    setShowModal(true);
    await fetchReturnItems(returnItem.id);
  };

  const handleAction = async (action: 'approved' | 'rejected' | 'return_picked' | 'return_received' | 'return_complete', row?: any) => {
    const targetReturn = row || selectedReturn;
    if (!targetReturn) return;
    setActionLoading(true);
    try {
    // Update return status
    const { error: returnError } = await supabase
      .from('returns')
        .update({ status: action })
        .eq('id', targetReturn.id);
      if (returnError) throw returnError;
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
        .update({ status: action })
        .eq('id', targetReturn.order_id);
      if (orderError) throw orderError;
      toast.success(`Return request ${action.replace('_', ' ')}`);
      setShowModal(false);
      fetchReturns();
    } catch (err) {
      console.error('Error updating return status:', err);
      toast.error('Failed to update return status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionForRow = async (row: any, action: any) => {
    setSelectedReturn(row);
    await handleAction(action);
  };

  const filteredReturns = returns.filter((ret) => {
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    const matchesSearch = search.trim() === '' || 
      ret.orders?.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      ret.orders?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      ret.orders?.customer_email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Returns Management</h1>
            <p className="text-gray-400">Manage and process customer return requests</p>
          </div>
          <Button
            onClick={fetchReturns}
            className="bg-gray-800 hover:bg-gray-700 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Total Returns</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Approved</div>
              <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Picked</div>
              <div className="text-2xl font-bold text-blue-400">{stats.picked}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Received</div>
              <div className="text-2xl font-bold text-purple-400">{stats.received}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Completed</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
              <Input
              placeholder="Search by order number, customer name, or email..."
                value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="return_picked">Picked</SelectItem>
              <SelectItem value="return_received">Received</SelectItem>
              <SelectItem value="return_complete">Completed</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Returns Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Order</TableHead>
                  <TableHead className="text-gray-400">Customer</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Return Type</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
            ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-400">
                      {error}
                    </TableCell>
                  </TableRow>
            ) : filteredReturns.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No returns found
                    </TableCell>
                    </TableRow>
                ) : (
                  filteredReturns.map((ret) => {
                    // Determine return type
                    let returnType = 'Partial Return';
                    if (ret.orders && ret.orders.order_items && ret.return_item_details) {
                      // Sum up all ordered quantities
                      const totalOrdered = ret.orders.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                      // Sum up all returned quantities
                      const totalReturned = ret.return_item_details.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                      if (totalOrdered > 0 && totalReturned === totalOrdered) {
                        returnType = 'Complete Return';
                      }
                    }
                    return (
                      <TableRow key={ret.id} className="border-gray-800">
                        <TableCell className="text-white">
                          {ret.orders?.order_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-white">{ret.orders?.customer_name || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">{ret.orders?.customer_email || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-white">
                          ₹{ret.orders?.total_amount || 0}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[ret.status as keyof typeof statusColors]}>
                            {ret.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{returnType}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(ret.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                          variant="ghost"
                            size="sm"
                          onClick={() => handleViewReturn(ret)}
                          className="text-gray-400 hover:text-white"
                          >
                          <Eye className="w-4 h-4" />
                          </Button>
                          {['approved', 'return_picked', 'return_received', 'return_complete'].includes(ret.status) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Edit className="w-4 h-4" />
                          </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAction('return_picked', ret)}>
                                  <Package className="w-4 h-4 mr-2" /> Mark as Picked
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('return_received', ret)}>
                                  <Truck className="w-4 h-4 mr-2" /> Mark as Received
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setCompleteTargetReturn(ret); setShowCompleteDialog(true); setCompleteKey(''); setRefundPercent(100); setCompleteError(''); }}>
                                  <CheckSquare className="w-4 h-4 mr-2" /> Mark as Complete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                  </TableBody>
                </Table>
          </CardContent>
        </Card>

        {/* Return Details Modal */}
                  {selectedReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedReturn(null)}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10">
              {/* Close Button */}
              <button
                onClick={() => setSelectedReturn(null)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 space-y-6">
                {/* Order & Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Order Number:</span>
                          <span className="text-white">{selectedReturn.orders?.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Amount:</span>
                          <span className="text-white">₹{selectedReturn.orders?.total_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Return Status:</span>
                          <Badge className={statusColors[selectedReturn.status as keyof typeof statusColors]}>
                            {selectedReturn.status.replace('_', ' ')}
                          </Badge>
                      </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{selectedReturn.orders?.customer_name}</span>
                          </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white">{selectedReturn.orders?.customer_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Phone:</span>
                          <span className="text-white">{selectedReturn.orders?.customer_phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Return Items */}
                {returnItemsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : returnItems.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Returned Items</h3>
                              {returnItems.map((item, idx) => (
                      <Card key={item.id || idx} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Product Images */}
                            <div className="flex flex-col gap-4 min-w-[140px] max-w-[160px]">
                              {/* Website Product Image */}
                              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 relative flex items-center justify-center">
                                    {item.order_items?.product_image ? (
                                  <img
                                    src={item.order_items.product_image}
                                    alt={item.order_items.product_name}
                                    className="w-full h-full object-cover"
                                    style={{ maxWidth: '128px', maxHeight: '128px' }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No Image
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                  Website Image
                                  </div>
                              </div>

                              {/* Return Photos */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Return Photos</h4>
                                {item.item_photos && item.item_photos.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    {item.item_photos.map((photo: string, index: number) => (
                                      <a
                                        key={index}
                                        href={photo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center"
                                      >
                                        <img
                                          src={photo}
                                          alt={`Return photo ${index + 1}`}
                                          className="w-full h-full object-cover"
                                          style={{ maxWidth: '64px', maxHeight: '64px' }}
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-image.png';
                                            console.error(`Failed to load return photo ${index + 1}:`, photo);
                                          }}
                                        />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">No photos uploaded</div>
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 space-y-4 min-w-0">
                              <div>
                                <h4 className="text-lg font-semibold text-white truncate">
                                  {item.order_items?.product_name}
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="text-gray-400 text-sm">
                                    Ordered: {item.order_items?.quantity}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Returning: {item.quantity}
                                    {item.order_items?.quantity !== item.quantity && (
                                      <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                        Partial Return
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Price: ₹{item.order_items?.unit_price}
                                  </div>
                                </div>

                                <div className="space-y-2 break-words">
                                  <div className="text-gray-400 text-sm">
                                    Reason: <span className="text-white break-words">{item.item_reason || 'No reason provided'}</span>
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Description: <span className="text-white break-words" style={{ wordBreak: 'break-word' }}>{item.item_description || 'No description provided'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Photos */}
                              {item.item_photos && item.item_photos.length > 1 && (
                                <div>
                                  <div className="text-gray-400 text-sm mb-2">Additional Photos:</div>
                                        <div className="flex flex-wrap gap-2">
                                    {item.item_photos.slice(1).map((url: string, i: number) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center"
                                      >
                                        <img
                                          src={url}
                                          alt={`Additional photo ${i + 2}`}
                                          className="w-full h-full object-cover"
                                          style={{ maxWidth: '64px', maxHeight: '64px' }}
                                        />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                      </CardContent>
                    </Card>
                              ))}
                            </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No items found in this return
                          </div>
                      )}

                      {/* Action Buttons */}
                      {selectedReturn.status === 'pending' && (
                  <div className="flex flex-wrap gap-4 pt-4">
                          <Button
                            variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                            onClick={() => handleAction('approved')}
                            disabled={actionLoading}
                          >
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve Return
                          </Button>
                          <Button
                            variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => handleAction('rejected')}
                            disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject Return
                          </Button>
                        </div>
                      )}
                      {['approved', 'return_picked', 'return_received', 'return_complete'].includes(selectedReturn.status) && (
                        <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                          variant="outline"
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                            onClick={() => { setShowOverrideDialog('reject'); setOverrideKey(''); setOverrideError(''); setTimeout(() => overrideInputRef.current?.focus(), 100); }}
                        >
                            Override Reject
                        </Button>
                    </div>
                  )}
                </div>
                    </div>
                        </div>
        )}

        {/* Override Dialog */}
        <Dialog open={!!showOverrideDialog} onOpenChange={() => setShowOverrideDialog(null)}>
          <DialogContent className="bg-gray-950/95 text-white max-w-md p-0 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative">
            <div className="max-h-[80vh] overflow-y-auto p-0">
              <DialogHeader className="sticky top-0 z-10 bg-gray-950/95 border-b border-gray-800 px-8 py-6">
                <DialogTitle className="text-2xl font-bold text-neon-cyan tracking-tight">
                  {showOverrideDialog === 'approve' ? 'Override Approve Return' : 'Override Reject Return'}
                </DialogTitle>
                    <DialogDescription className="text-gray-400 mt-1">
                  Enter the override key to {showOverrideDialog === 'approve' ? 'approve' : 'reject'} this return. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
              <div className="px-8 py-6 space-y-6">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Override Key</label>
                  <input
                        ref={overrideInputRef}
                    type="password"
                    value={overrideKey}
                    onChange={e => setOverrideKey(e.target.value)}
                        className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                    placeholder="Override Key"
                    autoFocus
                  />
                  </div>
                    {overrideError && (
                      <div className="text-red-400 text-sm">{overrideError}</div>
                    )}
                          </div>
                  <div className="flex justify-end gap-4 mt-6">
                          <Button
                            variant="outline"
                      onClick={() => setShowOverrideDialog(null)}
                      className="border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
                          >
                      Cancel
                          </Button>
                          <Button
                            variant="outline"
                      onClick={async () => {
                        if (overrideKey !== 'sk8802331956') {
                          setOverrideError('Invalid override key.');
                          return;
                        }
                        setOverrideError('');
                        setShowOverrideDialog(null);

                        // If the return is completed, revert the wallet refund
                        if (selectedReturn.status === 'return_complete' && selectedReturn.refund_amount) {
                          const { data: wallet, error: walletError } = await supabase
                            .from('user_wallets')
                            .select('*')
                            .eq('user_id', selectedReturn.user_id)
                            .single();

                          if (walletError) {
                            console.error('Wallet fetch error:', walletError);
                            toast.error('Failed to fetch wallet for revert.');
                            return;
                          }

                          const { error: walletUpdateError } = await supabase
                            .from('user_wallets')
                            .update({ 
                              balance: parseFloat((wallet.balance || 0).toString()) - selectedReturn.refund_amount,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', wallet.id);

                          if (walletUpdateError) {
                            console.error('Wallet revert error:', walletUpdateError);
                            toast.error('Failed to revert wallet refund.');
                            return;
                          }
                        }

                        // Update return and order status to 'rejected'
                        await handleAction('rejected');
                      }}
                      className="border-yellow-600 text-yellow-400 bg-gray-900 hover:bg-yellow-900 hover:text-white font-bold px-6 py-2"
                    >
                      {showOverrideDialog === 'approve' ? 'Override Approve' : 'Override Reject'}
                          </Button>
                      </div>
                    </div>
              </div>
                </div>
              </DialogContent>
            </Dialog>

        {/* Mark Complete Dialog */}
        <Dialog open={showCompleteDialog && !!completeTargetReturn} onOpenChange={(open) => {
          setShowCompleteDialog(open);
          if (!open) setCompleteTargetReturn(null);
        }}>
          <DialogContent className="bg-gray-950/95 text-white max-w-md p-0 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative">
                <div className="max-h-[80vh] overflow-y-auto p-0">
                  <DialogHeader className="sticky top-0 z-10 bg-gray-950/95 border-b border-gray-800 px-8 py-6">
                    <DialogTitle className="text-2xl font-bold text-neon-cyan tracking-tight">Mark Return as Completed</DialogTitle>
                    <DialogDescription className="text-gray-400 mt-1">
                      Enter the override key and refund percent to complete the return.<br />
                      <span className="text-xs text-gray-500">
                    Refund amount: ₹{completeTargetReturn ? Math.round(completeTargetReturn.orders?.total_amount * (refundPercent / 100)) : 0}
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-8 py-6 space-y-6">
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Override Key</label>
                          <input
                            type="password"
                            value={completeKey}
                            onChange={e => setCompleteKey(e.target.value)}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            placeholder="Override Key"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Refund Percent (%)</label>
                          <input
                            type="number"
                            min={0}
                            max={1000}
                            value={refundPercent}
                            onChange={e => setRefundPercent(Number(e.target.value))}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            placeholder="100"
                          />
                        </div>
                        {completeError && (
                          <div className="text-red-400 text-sm">{completeError}</div>
                        )}
                      </div>
                      <div className="flex justify-end gap-4 mt-6">
                        <Button
                          variant="outline"
                      onClick={() => { setShowCompleteDialog(false); setCompleteTargetReturn(null); }}
                          className="border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                      onClick={async () => {
                        if (completeKey !== 'sk8802331956') {
                          setCompleteError('Invalid override key.');
                          return;
                        }
                        setCompleteLoading(true);
                        setCompleteError('');

                        try {
                          if (!completeTargetReturn || !completeTargetReturn.user_id) {
                            setCompleteError('User ID missing for this return.');
                            setCompleteLoading(false);
                            return;
                          }
                          // Use refund_amount as base
                          const refundBase = completeTargetReturn.refund_amount || 0;
                          const refundAmount = Math.round(refundBase * (refundPercent / 100));
                          if (refundAmount <= 0) {
                            setCompleteError('Refund amount must be greater than zero.');
                            setCompleteLoading(false);
                            return;
                          }
                          // 1. Check if wallet exists
                          const { data: wallet, error: walletError } = await supabase
                            .from('user_wallets')
                            .select('*')
                            .eq('user_id', completeTargetReturn.user_id)
                            .single();
                          if (walletError && walletError.code !== 'PGRST116') {
                            setCompleteError('Failed to fetch wallet: ' + walletError.message);
                            setCompleteLoading(false);
                            return;
                          }
                          let walletUpdateError = null;
                          if (wallet) {
                            // 2a. Update existing wallet
                            const { data: updatedWallet, error } = await supabase
                              .from('user_wallets')
                              .update({ 
                                balance: parseFloat((wallet.balance || 0).toString()) + refundAmount,
                                updated_at: new Date().toISOString()
                              })
                              .eq('id', wallet.id)
                              .select();
                            walletUpdateError = error;
                            if (!updatedWallet) {
                              setCompleteError('Wallet update failed: No data returned.');
                              setCompleteLoading(false);
                              return;
                            }
                          } else {
                            // 2b. Insert new wallet
                            const { data: insertedWallet, error } = await supabase
                              .from('user_wallets')
                              .insert({ 
                                user_id: completeTargetReturn.user_id,
                                balance: refundAmount,
                                updated_at: new Date().toISOString()
                              })
                              .select();
                            walletUpdateError = error;
                            if (!insertedWallet) {
                              setCompleteError('Wallet insert failed: No data returned.');
                              setCompleteLoading(false);
                              return;
                            }
                          }
                          if (walletUpdateError) {
                            setCompleteError('Failed to update wallet: ' + walletUpdateError.message);
                            setCompleteLoading(false);
                            return;
                          }
                          // 3. Update return record with refund amount and status
                          const { error: returnUpdateError } = await supabase
                            .from('returns')
                            .update({ refund_amount: refundAmount, status: 'return_complete' })
                            .eq('id', completeTargetReturn.id);
                          if (returnUpdateError) {
                            setCompleteError('Failed to update return record: ' + returnUpdateError.message);
                            setCompleteLoading(false);
                            return;
                          }
                          // 4. Update order status
                          const { error: orderUpdateError } = await supabase
                            .from('orders')
                            .update({ status: 'return_complete' })
                            .eq('id', completeTargetReturn.order_id);
                          if (orderUpdateError) {
                            setCompleteError('Failed to update order status: ' + orderUpdateError.message);
                            setCompleteLoading(false);
                            return;
                          }
                          // 5. Add wallet transaction
                          await supabase.from('wallet_transactions').insert([
                            {
                              user_id: completeTargetReturn.user_id,
                              amount: refundAmount,
                              type: 'refund',
                              description: `Refund for return #${completeTargetReturn.id}`,
                            }
                          ]);
                          toast.success('Return marked as completed and wallet updated.');
                          setShowCompleteDialog(false);
                          setCompleteTargetReturn(null);
                          fetchReturns();
                        } catch (err) {
                          setCompleteError('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
                        } finally {
                          setCompleteLoading(false);
                        }
                      }}
                          className="border-neon-cyan text-neon-cyan bg-gray-900 hover:bg-neon-cyan hover:text-black font-bold px-6 py-2"
                          disabled={completeLoading}
                        >
                          {completeLoading ? 'Processing...' : 'Complete Return'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReturns; 