# Return Management System Fixes

## Overview
This document outlines the detailed implementation steps to fix several issues in the return management system:
1. Wallet functionality for return completion
2. Order edit restrictions when returns are initiated
3. Return view modal edit options
4. Key popup UI consistency

## 1. Wallet Functionality Fix

### A. Database Schema & Policies
```sql
-- Existing table schema
create table public.user_wallets (
  id uuid not null default gen_random_uuid(),
  user_id uuid null,
  balance numeric(10, 2) not null default 0,
  updated_at timestamp with time zone null default now(),
  constraint user_wallets_pkey primary key (id),
  constraint user_wallets_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);

-- Required RLS Policies
-- 1. Allow users to view their own wallet
create policy "Users can view their own wallet"
  on user_wallets
  for select
  using (auth.uid() = user_id);

-- 2. Allow authenticated users (admins) to manage wallets
create policy "Admins can manage wallets"
  on user_wallets
  for all
  using (auth.role() = 'authenticated');
```

### B. Code Implementation
Update the wallet update logic in `AdminReturns.tsx`:

```typescript
// In the Mark as Completed dialog submit handler
const handleCompleteReturn = async () => {
  setCompleteError('');
  if (completeKey !== 'sk8802331956') {
    setCompleteError('Invalid override key.');
    return;
  }
  if (!selectedReturn) return;
  if (isNaN(refundPercent) || refundPercent < 0) {
    setCompleteError('Enter a valid percent.');
    return;
  }
  setCompleteLoading(true);
  try {
    const refundAmount = Math.round(selectedReturn.refund_amount * (refundPercent / 100));
    
    // 1. Check if wallet exists
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', selectedReturn.user_id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Wallet fetch error:', walletError);
      setCompleteError('Failed to fetch wallet.');
      setCompleteLoading(false);
      return;
    }

    let walletUpdateError = null;
    if (wallet) {
      // 2a. Update existing wallet
      const { error } = await supabase
        .from('user_wallets')
        .update({ 
          balance: parseFloat((wallet.balance || 0).toString()) + refundAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id); // Use id for update
      walletUpdateError = error;
    } else {
      // 2b. Insert new wallet
      const { error } = await supabase
        .from('user_wallets')
        .insert({ 
          user_id: selectedReturn.user_id,
          balance: refundAmount,
          updated_at: new Date().toISOString()
        });
      walletUpdateError = error;
    }

    if (walletUpdateError) {
      console.error('Wallet update error:', walletUpdateError);
      setCompleteError('Failed to update wallet.');
      setCompleteLoading(false);
      return;
    }

    // 3. Update return and order status
    const { error: returnError } = await supabase
      .from('returns')
      .update({ status: 'return_complete' })
      .eq('id', selectedReturn.id);

    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'return_complete' })
      .eq('id', selectedReturn.order_id);

    if (returnError || orderError) {
      console.error('Status update error:', { returnError, orderError });
      setCompleteError('Failed to update status.');
      setCompleteLoading(false);
      return;
    }

    toast.success('Return marked as completed and wallet updated.');
    setShowCompleteDialog(false);
    setShowEditModal(false);
    fetchReturns();
  } catch (err) {
    console.error('Unexpected error:', err);
    setCompleteError('Unexpected error occurred.');
  } finally {
    setCompleteLoading(false);
  }
};
```

## 2. Order Edit Restrictions

### A. Update Orders Page
In `AdminOrders.tsx`:

```typescript
// Add state for return status
const [orderReturnMap, setOrderReturnMap] = useState<Record<string, any>>({});

// Update fetchOrders function
const fetchOrders = async () => {
  setLoading(true);
  try {
    // 1. Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // 2. Fetch returns for these orders
    const orderIds = orders.map(o => o.id);
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('*')
      .in('order_id', orderIds);

    if (returnsError) throw returnsError;

    // 3. Create map of order_id to return status
    const returnMap: Record<string, any> = {};
    returns.forEach(r => {
      returnMap[r.order_id] = r;
    });

    setOrderReturnMap(returnMap);
    setOrders(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error('Failed to fetch orders');
  } finally {
    setLoading(false);
  }
};

// Update the edit button in the table
<Button
  variant="outline"
  className="border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
  disabled={orderReturnMap[order.id]?.status}
  onClick={() => handleEditOrder(order)}
  title={orderReturnMap[order.id]?.status ? 'Edit disabled: Return in progress' : 'Edit order'}
>
  <Edit className="h-4 w-4" />
</Button>
```

## 3. Return View Modal Edit Options

### A. Update Return View Modal
In `AdminReturns.tsx`:

```typescript
// In the view modal content
<div className="px-8 py-6 space-y-6">
  {/* Return Details */}
  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
    <div className="font-semibold text-gray-300 mb-2">Return Details</div>
    {/* ... existing return details ... */}
  </div>

  {/* Edit Options - Only show if not approved/in-progress */}
  {!['approved', 'return_approved', 'return_picked', 'return_received', 'return_complete'].includes(selectedReturn.status) && (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="font-semibold text-gray-300 mb-2">Actions</div>
      <div className="flex flex-col md:flex-row gap-4 justify-end pt-2">
        <Button
          variant="outline"
          className="border-green-600 text-green-300 bg-gray-900 hover:bg-green-900 hover:text-white font-bold px-6 py-2"
          disabled={actionLoading}
          onClick={() => handleAction('approved')}
        >
          {actionLoading ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          variant="outline"
          className="border-red-600 text-red-300 bg-gray-900 hover:bg-red-900 hover:text-white font-bold px-6 py-2"
          disabled={actionLoading}
          onClick={() => handleAction('rejected')}
        >
          {actionLoading ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    </div>
  )}
</div>
```

## 4. Key Popup UI Consistency

### A. Update Key Popup Dialog
In `AdminReturns.tsx`:

```typescript
{/* Override Reject Dialog */}
<Dialog open={showOverrideRejectDialog} onOpenChange={setShowOverrideRejectDialog}>
  <DialogContent className="bg-gray-950/95 text-white max-w-2xl p-0 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative" style={{ boxShadow: '0 8px 40px 0 #000a, 0 1.5px 8px 0 #0008' }}>
    <div className="fixed inset-0 bg-black/80 z-[-1]" />
    <div className="max-h-[80vh] overflow-y-auto p-0">
      <DialogHeader className="sticky top-0 z-10 bg-gray-950/95 border-b border-gray-800 px-8 py-6">
        <DialogTitle className="text-2xl font-bold text-neon-cyan tracking-tight">Override Reject Return</DialogTitle>
        <DialogDescription className="text-gray-400 mt-1">
          Enter the override key to reject this return. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div className="px-8 py-6 space-y-6">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Override Key</label>
              <input
                type="password"
                value={overrideRejectKey}
                onChange={e => setOverrideRejectKey(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                placeholder="Override Key"
                autoFocus
              />
            </div>
            {overrideRejectError && (
              <div className="text-red-400 text-sm">{overrideRejectError}</div>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowOverrideRejectDialog(false)}
              className="border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleOverrideReject}
              className="border-yellow-600 text-yellow-300 bg-gray-900 hover:bg-yellow-900 hover:text-white font-bold px-6 py-2"
              disabled={overrideRejectLoading}
            >
              {overrideRejectLoading ? 'Processing...' : 'Override Reject'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

{/* Mark as Completed Dialog - Similar structure */}
<Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
  <DialogContent className="bg-gray-950/95 text-white max-w-2xl p-0 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden relative" style={{ boxShadow: '0 8px 40px 0 #000a, 0 1.5px 8px 0 #0008' }}>
    <div className="fixed inset-0 bg-black/80 z-[-1]" />
    <div className="max-h-[80vh] overflow-y-auto p-0">
      <DialogHeader className="sticky top-0 z-10 bg-gray-950/95 border-b border-gray-800 px-8 py-6">
        <DialogTitle className="text-2xl font-bold text-neon-cyan tracking-tight">Mark Return as Completed</DialogTitle>
        <DialogDescription className="text-gray-400 mt-1">
          Enter the override key and refund percent to complete the return.<br />
          <span className="text-xs text-gray-500">
            Refund amount: ₹{selectedReturn?.refund_amount} × {refundPercent}% = 
            <span className="text-neon-cyan font-bold">
              ₹{selectedReturn ? Math.round(selectedReturn.refund_amount * (refundPercent / 100)) : 0}
            </span>
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
              onClick={() => setShowCompleteDialog(false)}
              className="border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleCompleteReturn}
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
```

## Testing Checklist

### 1. Wallet Functionality
- [ ] Test with new user (no wallet)
- [ ] Test with existing user (has wallet)
- [ ] Verify balance updates correctly
- [ ] Check error handling for invalid inputs
- [ ] Verify RLS policies work as expected

### 2. Order Edit Restrictions
- [ ] Verify edit button is disabled for orders with returns
- [ ] Check tooltip shows correct message
- [ ] Test with orders that have no returns
- [ ] Verify real-time updates when return status changes

### 3. Return View Modal
- [ ] Check edit options are hidden for approved returns
- [ ] Verify edit options show for pending returns
- [ ] Test all return status transitions
- [ ] Verify UI consistency across all states

### 4. Key Popup UI
- [ ] Compare UI with edit/view modals
- [ ] Test keyboard navigation
- [ ] Verify focus management
- [ ] Check responsive design
- [ ] Test error states and loading indicators

## Error Handling

### Common Errors and Solutions
1. **Wallet Update Failed**
   - Check RLS policies
   - Verify user_id exists
   - Ensure numeric values are properly parsed

2. **Order Edit Disabled**
   - Verify return status mapping
   - Check order-return relationship
   - Test edge cases (multiple returns)

3. **UI Inconsistencies**
   - Compare class names
   - Check shadow and border styles
   - Verify spacing and padding

4. **Key Validation**
   - Test invalid keys
   - Check loading states
   - Verify error messages

## Performance Considerations

1. **Database Queries**
   - Use efficient joins
   - Implement proper indexing
   - Cache frequently accessed data

2. **UI Updates**
   - Optimize re-renders
   - Use proper state management
   - Implement loading states

3. **Error Boundaries**
   - Add try-catch blocks
   - Implement fallback UI
   - Log errors properly

## Security Considerations

1. **RLS Policies**
   - Review all policies
   - Test with different user roles
   - Verify data isolation

2. **Key Management**
   - Secure key storage
   - Implement rate limiting
   - Add audit logging

3. **Input Validation**
   - Sanitize all inputs
   - Validate numeric values
   - Check string lengths

## Deployment Steps

1. **Database Updates**
   ```sql
   -- Run RLS policies
   -- Verify table structure
   -- Check indexes
   ```

2. **Code Deployment**
   - Update components
   - Test in staging
   - Monitor error rates

3. **Post-Deployment**
   - Monitor wallet updates
   - Check order restrictions
   - Verify UI consistency 