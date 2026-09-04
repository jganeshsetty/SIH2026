import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';

export function AddCropForm({ onComplete }: { onComplete: () => void }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    minPrice: '',
    quality: '',
    harvestDate: '',
    pickupLocation: '',
    description: '',
    deliveryAvailable: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          expectedPrice: parseFloat(formData.expectedPrice),
          minPrice: parseFloat(formData.minPrice),
          harvestDate: new Date(formData.harvestDate).toISOString()
        })
      });
      if (res.ok) {
        onComplete();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || 'Failed to list crop');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-farmora-border">
      <h3 className="font-bold text-xl mb-4 text-farmora-text">List a New Crop</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Crop Name</Label>
          <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Tomato" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input id="variety" name="variety" required value={formData.variety} onChange={handleChange} placeholder="e.g. Roma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex gap-2">
             <Input id="quantity" name="quantity" type="number" required value={formData.quantity} onChange={handleChange} placeholder="0" className="flex-1" />
             <select name="unit" value={formData.unit} onChange={handleChange} className="border rounded-md px-3 bg-transparent">
               <option value="kg">kg</option>
               <option value="ton">ton</option>
               <option value="quintal">quintal</option>
             </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest Date</Label>
          <Input id="harvestDate" name="harvestDate" type="date" required value={formData.harvestDate} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedPrice">Expected Price (₹/unit)</Label>
          <Input id="expectedPrice" name="expectedPrice" type="number" required value={formData.expectedPrice} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice">Minimum Acceptable Price</Label>
          <Input id="minPrice" name="minPrice" type="number" required value={formData.minPrice} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quality">Quality / Grade</Label>
          <Input id="quality" name="quality" required value={formData.quality} onChange={handleChange} placeholder="e.g. Grade A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pickupLocation">Pickup Location</Label>
          <Input id="pickupLocation" name="pickupLocation" required value={formData.pickupLocation} onChange={handleChange} placeholder="City, State" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="deliveryAvailable" name="deliveryAvailable" checked={formData.deliveryAvailable} onChange={handleChange} className="rounded border-farmora-border text-farmora-primary focus:ring-farmora-primary" />
        <Label htmlFor="deliveryAvailable">I can arrange delivery</Label>
      </div>
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full rounded-xl">
        {loading ? 'Listing...' : 'List Crop'}
      </Button>
    </form>
  );
}
