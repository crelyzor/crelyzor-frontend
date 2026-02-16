import { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardUrl: string;
  cardName: string;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  cardUrl,
  cardName,
}: QRCodeDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderQR = useCallback(async () => {
    if (!canvasRef.current || !open) return;
    await QRCode.toCanvas(canvasRef.current, cardUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#171717', light: '#ffffff' },
    });
  }, [cardUrl, open]);

  useEffect(() => {
    renderQR();
  }, [renderQR]);

  const downloadPNG = async () => {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, cardUrl, {
      width: 1024,
      margin: 2,
      color: { dark: '#171717', light: '#ffffff' },
    });
    const link = document.createElement('a');
    link.download = `${cardName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadSVG = async () => {
    const svgString = await QRCode.toString(cardUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: '#171717', light: '#ffffff' },
    });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `${cardName.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code so people can view your card
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 bg-white">
            <canvas ref={canvasRef} />
          </div>

          <p className="text-xs text-neutral-400 text-center break-all max-w-[260px]">
            {cardUrl}
          </p>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm gap-2"
              onClick={downloadPNG}
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm gap-2"
              onClick={downloadSVG}
            >
              <Download className="w-3.5 h-3.5" />
              SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
