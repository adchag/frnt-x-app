'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { upload_file, get_file_url, delete_file, list_files } from '@/services/storage.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const ConvertPDFPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !fileName) {
      toast({
        title: 'Error',
        description: 'Please select a PDF file and provide a file name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file, fileName);
      
      // Simulate progress
      const simulateProgress = () => {
        setUploadProgress((prev) => {
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      };
      const progressInterval = setInterval(simulateProgress, 500);

      const result = await upload_file(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

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
      setUploadProgress(0);
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

  const handleOpen = async (path: string) => {
    try {
      const pdfUrl = await get_file_url(path);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to open PDF',
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
            <div>
              <Label htmlFor="file-name">File Name</Label>
              <Input 
                id="file-name" 
                type="text" 
                value={fileName} 
                onChange={handleFileNameChange} 
                placeholder="Enter file name"
              />
            </div>
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} className="w-full" />
            )}
            <Button type="submit" isLoading={isLoading}>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdfList.map((pdf) => (
                <TableRow key={pdf.name}>
                  <TableCell>{pdf.name}</TableCell>
                  <TableCell>{new Date(pdf.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleOpen(pdf.name)} variant="outline" size="sm">
                        Open
                      </Button>
                      <Button onClick={() => handleDelete(pdf.name)} variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
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