import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const REASON_OPTIONS = [
  "Wrong Size",
  "Quality Issue",
  "Not as Described",
  "Damaged",
  "Wrong Item",
  "Changed Mind",
  "Other"
];

interface ReturnItemFormProps {
  item: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    product_image: string;
    size: string;
  };
  onFormChange: (itemId: string, data: any) => void;
  isSubmitting: boolean;
}

export function ReturnItemForm({ item, onFormChange, isSubmitting }: ReturnItemFormProps) {
  const [formData, setFormData] = useState({
    quantity: 1,
    reason: "",
    details: "",
    images: [] as File[]
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 3,
    onDrop: (acceptedFiles) => {
      setFormData(prev => {
        const newData = {
          ...prev,
          images: [...prev.images, ...acceptedFiles].slice(0, 3)
        };
        onFormChange(item.id, newData);
        return newData;
      });
    }
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.quantity) {
      setFormData(prev => {
        const newData = { ...prev, quantity: newQuantity };
        onFormChange(item.id, newData);
        return newData;
      });
    }
  };

  const handleReasonChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, reason: value };
      onFormChange(item.id, newData);
      return newData;
    });
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => {
      const newData = { ...prev, details: e.target.value };
      onFormChange(item.id, newData);
      return newData;
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newData = { ...prev, images: newImages };
      onFormChange(item.id, newData);
      return newData;
    });
  };

  return (
    <Card className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
      <div className="space-y-6">
        {/* Item Info */}
        <div className="flex items-start gap-4">
          <img
            src={item.product_image}
            alt={item.product_name}
            className="w-20 h-20 object-cover rounded-lg border border-gray-800"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{item.product_name}</h3>
            <p className="text-sm text-gray-400">Size: {item.size}</p>
            <p className="text-sm text-gray-400">Price: ₹{item.unit_price}</p>
            <p className="text-sm text-gray-400">Ordered Quantity: {item.quantity}</p>
          </div>
        </div>

        {/* Return Quantity */}
        <div className="space-y-2">
          <Label className="text-white">Return Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              onClick={() => handleQuantityChange(formData.quantity - 1)}
              disabled={formData.quantity <= 1 || isSubmitting}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-white">{formData.quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              disabled={formData.quantity >= item.quantity || isSubmitting}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reason for Return */}
        <div className="space-y-2">
          <Label className="text-white">Reason for Return</Label>
          <Select
            value={formData.reason}
            onValueChange={handleReasonChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {REASON_OPTIONS.map((reason) => (
                <SelectItem
                  key={reason}
                  value={reason}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <Label className="text-white">Additional Details</Label>
          <Textarea
            value={formData.details}
            onChange={handleDetailsChange}
            placeholder="Please provide more details about your return..."
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            disabled={isSubmitting}
            minLength={30}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-white">Upload Photos (Max 3)</Label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-600 transition-colors"
          >
            <input {...getInputProps()} disabled={isSubmitting} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              Drag & drop photos here, or click to select files
            </p>
          </div>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-gray-900/50 hover:bg-gray-900"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 