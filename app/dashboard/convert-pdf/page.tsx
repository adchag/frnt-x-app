'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConvertPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement PDF conversion logic here
    toast({
      title: 'Success',
      description: 'PDF converted successfully',
    });
  };

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Convert PDF to Text</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pdf-upload">Select PDF</Label>
              <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
            <Button type="submit">Convert</Button>
          </form>
        </CardContent>
      </Card>
      {extractedText && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={extractedText} readOnly rows={10} />
          </CardContent>
        </Card>
      )}
    </>
  );
}