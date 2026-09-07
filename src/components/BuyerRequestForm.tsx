import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Crop } from '../types';

export function BuyerRequestForm({ crop, onComplete }: { crop: Crop, onComplete: () => void }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    quantity: crop.quantity.toString(),
    offeredPrice: crop.expectedPrice.toString(),
    deliveryRequired: false,
    deliveryLocation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: crop.id,
          quantity: parseFloat(formData.quantity),
          offeredPrice: parseFloat(formData.offeredPrice),
          deliveryRequired: formData.deliveryRequired,
          deliveryLocation: formData.deliveryLocation
        })
      });
      if (res.ok) {
        onComplete();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.error || 'Failed to submit offer');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-farmora-border">
      <h3 className="font-bold text-xl mb-4 text-farmora-text">Submit Your Offer</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="req-quantity">Requested Quantity ({crop.unit})</Label>
          <Input id="req-quantity" name="quantity" type="number" max={crop.quantity} required value={formData.quantity} onChange={handleChange} />
          <p className="text-xs text-farmora-subtext">Max available: {crop.quantity}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offeredPrice">Your Offer Price (₹/{crop.unit})</Label>
          <Input id="offeredPrice" name="offeredPrice" type="number" required value={formData.offeredPrice} onChange={handleChange} />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <input type="checkbox" id="deliveryRequired" name="deliveryRequired" checked={formData.deliveryRequired} onChange={handleChange} className="rounded border-farmora-border text-farmora-primary focus:ring-farmora-primary" />
          <Label htmlFor="deliveryRequired">I need delivery</Label>
        </div>
        {formData.deliveryRequired && (
          <div className="space-y-2">
            <Label htmlFor="deliveryLocation">Delivery Location / Address</Label>
            <Input id="deliveryLocation" name="deliveryLocation" required value={formData.deliveryLocation} onChange={handleChange} placeholder="Full address" />
          </div>
        )}
      </div>
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium mt-4">
          {errorMsg}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full mt-4 rounded-xl">
        {loading ? 'Submitting...' : 'Submit Offer'}
      </Button>
    </form>
  );
}
