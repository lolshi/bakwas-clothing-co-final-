
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface BannersSectionProps {
  banners: Banner[];
  onAddBanner: () => void;
  onEditBanner: (banner: Banner) => void;
  onToggleBannerStatus: (bannerId: string, isActive: boolean) => void;
  onDeleteBanner: (bannerId: string) => void;
}

const BannersSection: React.FC<BannersSectionProps> = ({
  banners,
  onAddBanner,
  onEditBanner,
  onToggleBannerStatus,
  onDeleteBanner
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Homepage Banners</CardTitle>
            <CardDescription>
              Manage promotional banners displayed on your homepage
            </CardDescription>
          </div>
          <Button 
            className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
            onClick={onAddBanner}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {banners.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {banner.sort_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{banner.title || 'No title'}</TableCell>
                  <TableCell>{banner.subtitle || 'No subtitle'}</TableCell>
                  <TableCell>
                    {banner.link_url ? (
                      <a 
                        href={banner.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:underline"
                      >
                        Link
                      </a>
                    ) : (
                      'No link'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => onToggleBannerStatus(banner.id, checked)}
                      />
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditBanner(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No banners created yet</p>
            <Button onClick={onAddBanner}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Banner
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannersSection;
