'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { upload_file, download_file, delete_file, list_files } from '@/services/storage.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ConvertPDFPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfList, setPdfList] = useState<Array<{ name: string, created_at: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPDFList();
  }, []);

  const fetchPDFList = async () => {
    try {
      const list = await list_files();
      setPdfList(list);
    } catch (error) {
      console.error('Error fetching PDF list:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch PDF list',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await upload_file(formData);
      console.log('Upload result:', result);
      // Here you would typically call an API to extract text from the PDF
      // For now, we'll just set some dummy text
      setExtractedText('This is some extracted text from the PDF.');
      fetchPDFList();
      toast({
        title: 'Success',
        description: 'PDF uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload PDF',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await delete_file(path);
      fetchPDFList();
      toast({
        title: 'Success',
        description: 'PDF deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Convert PDF to Text</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pdf-upload">Select PDF</Label>
              <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload and Convert'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {extractedText && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={extractedText} readOnly rows={10} className="w-full" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Uploaded PDFs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdfList.map((pdf) => (
                <TableRow key={pdf.name}>
                  <TableCell>{pdf.name}</TableCell>
                  <TableCell>{new Date(pdf.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDelete(pdf.name)} variant="destructive" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConvertPDFPage;