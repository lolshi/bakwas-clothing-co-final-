import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Link as LinkIcon, Hash, FileText, ToggleLeft, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

interface Banner {
  title: string;
  subtitle: string;
  image_url: string;
  mobile_image_url: string;
  video_url: string | null;
  mobile_video_url: string | null;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  schedule_type?: 'always' | 'scheduled' | 'recurring';
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  target_audience?: 'all' | 'new' | 'returning' | 'vip';
  device_targeting: 'all' | 'desktop' | 'mobile' | 'tablet';
  media_type: 'image' | 'video';
  show_title: boolean;
  show_subtitle: boolean;
}

interface BannerFormFieldsProps {
  formData: Banner;
  onUpdateFormData: (updates: Partial<Banner>) => void;
}

const BannerFormFields: React.FC<BannerFormFieldsProps> = ({
  formData,
  onUpdateFormData
}) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Basic Information</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Main banner content and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onUpdateFormData({ title: e.target.value })}
              required
              placeholder="Enter banner title"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="show_title" className="flex items-center space-x-2 cursor-pointer">
              <span>Show Title on Banner</span>
              {formData.show_title ? (
                <Eye className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Switch
              id="show_title"
              checked={formData.show_title}
              onCheckedChange={(checked) => onUpdateFormData({ show_title: checked })}
            />
          </div>

          <div>
            <Label htmlFor="subtitle" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Subtitle
            </Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => onUpdateFormData({ subtitle: e.target.value })}
              rows={2}
              placeholder="Optional subtitle or description"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="show_subtitle" className="flex items-center space-x-2 cursor-pointer">
              <span>Show Subtitle on Banner</span>
              {formData.show_subtitle ? (
                <Eye className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Switch
              id="show_subtitle"
              checked={formData.show_subtitle}
              onCheckedChange={(checked) => onUpdateFormData({ show_subtitle: checked })}
            />
          </div>

          <div>
            <Label htmlFor="link_url" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Link URL
            </Label>
            <Input
              id="link_url"
              type="url"
              value={formData.link_url}
              onChange={(e) => onUpdateFormData({ link_url: e.target.value })}
              placeholder="https://example.com"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="image_url" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Desktop Image URL
            </Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => onUpdateFormData({ image_url: e.target.value })}
              placeholder="Enter desktop banner image URL"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="mobile_image_url" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Mobile Image URL
            </Label>
            <Input
              id="mobile_image_url"
              value={formData.mobile_image_url || ''}
              onChange={(e) => onUpdateFormData({ mobile_image_url: e.target.value })}
              placeholder="Enter mobile banner image URL (optional)"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If not provided, desktop image will be used for mobile</p>
          </div>

          <div>
            <Label htmlFor="video_url" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Desktop Video URL (Optional)
            </Label>
            <Input
              id="video_url"
              type="url"
              value={formData.video_url || ''}
              onChange={(e) => onUpdateFormData({ video_url: e.target.value })}
              placeholder="Enter desktop video URL"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="mobile_video_url" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Mobile Video URL (Optional)
            </Label>
            <Input
              id="mobile_video_url"
              type="url"
              value={formData.mobile_video_url || ''}
              onChange={(e) => onUpdateFormData({ mobile_video_url: e.target.value })}
              placeholder="Enter mobile video URL"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If not provided, desktop video will be used for mobile</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sort_order" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Priority Order
              </Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => onUpdateFormData({ sort_order: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lower numbers appear first</p>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => onUpdateFormData({ is_active: checked })}
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="active" className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Active
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calendar className="h-5 w-5" />
            Scheduling
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Control when this banner is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="schedule_type" className="text-gray-900 dark:text-gray-100">Schedule Type</Label>
            <Select 
              value={formData.schedule_type || 'always'} 
              onValueChange={(value) => onUpdateFormData({ schedule_type: value as any })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectItem value="always" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Always Active</SelectItem>
                <SelectItem value="scheduled" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Scheduled Period</SelectItem>
                <SelectItem value="recurring" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Recurring Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.schedule_type === 'scheduled' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-gray-900 dark:text-gray-100">Start Date & Time</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date || ''}
                  onChange={(e) => onUpdateFormData({ start_date: e.target.value })}
                  min={getCurrentDateTime()}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-gray-900 dark:text-gray-100">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date || ''}
                  onChange={(e) => onUpdateFormData({ end_date: e.target.value })}
                  min={formData.start_date || getCurrentDateTime()}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>
          )}

          {formData.schedule_type === 'recurring' && (
            <div>
              <Label htmlFor="recurring_pattern" className="text-gray-900 dark:text-gray-100">Recurring Pattern</Label>
              <Select 
                value={formData.recurring_pattern || 'weekly'} 
                onValueChange={(value) => onUpdateFormData({ recurring_pattern: value as any })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="daily" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Clock className="h-5 w-5" />
            Targeting
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Define who sees this banner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_audience" className="text-gray-900 dark:text-gray-100">Target Audience</Label>
              <Select 
                value={formData.target_audience || 'all'} 
                onValueChange={(value) => onUpdateFormData({ target_audience: value as any })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">All Visitors</SelectItem>
                  <SelectItem value="new" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">New Visitors</SelectItem>
                  <SelectItem value="returning" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Returning Customers</SelectItem>
                  <SelectItem value="vip" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">VIP Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="device_targeting" className="text-gray-900 dark:text-gray-100">Device Targeting</Label>
              <Select 
                value={formData.device_targeting || 'all'} 
                onValueChange={(value) => onUpdateFormData({ device_targeting: value as any })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">All Devices</SelectItem>
                  <SelectItem value="desktop" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Desktop Only</SelectItem>
                  <SelectItem value="mobile" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Mobile Only</SelectItem>
                  <SelectItem value="tablet" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">Tablet Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Preview Settings</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Schedule: {formData.schedule_type === 'always' ? 'Always active' : 
                formData.schedule_type === 'scheduled' ? 'Scheduled period' : 'Recurring'}</p>
              <p>• Audience: {formData.target_audience === 'all' ? 'All visitors' : 
                formData.target_audience === 'new' ? 'New visitors only' :
                formData.target_audience === 'returning' ? 'Returning customers' : 'VIP customers'}</p>
              <p>• Devices: {formData.device_targeting === 'all' ? 'All devices' : 
                (formData.device_targeting || 'all').charAt(0).toUpperCase() + (formData.device_targeting || 'all').slice(1) + ' only'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerFormFields;
