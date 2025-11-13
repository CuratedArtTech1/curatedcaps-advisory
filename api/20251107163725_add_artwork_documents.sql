/*
  # Add Artwork Documents Storage

  1. New Tables
    - `artwork_documents`
      - `id` (uuid, primary key) - Unique identifier for each document
      - `artwork_id` (uuid, foreign key) - References the artwork this document belongs to
      - `file_name` (text) - Original name of the uploaded file
      - `file_data` (text) - Base64 encoded file data
      - `file_type` (text) - MIME type of the file (e.g., 'application/pdf')
      - `file_size` (integer) - Size of the file in bytes
      - `description` (text, optional) - Optional description of the document
      - `created_at` (timestamptz) - When the document was uploaded
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `artwork_documents` table
    - Add policy for authenticated users to read documents for artworks they can access
    - Add policy for authenticated users to insert documents for artworks they can access
    - Add policy for authenticated users to delete their own documents

  3. Important Notes
    - Documents are stored as base64 encoded data in the database
    - Supports various file types (PDF, Word, Excel, images, etc.)
    - Each artwork can have multiple documents attached
*/

-- Create artwork_documents table
CREATE TABLE IF NOT EXISTS artwork_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_data text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE artwork_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read documents for artworks they can access
CREATE POLICY "Authenticated users can read documents"
  ON artwork_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = artwork_documents.artwork_id
    )
  );

-- Policy: Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert documents"
  ON artwork_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = artwork_documents.artwork_id
    )
  );

-- Policy: Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete documents"
  ON artwork_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artworks
      WHERE artworks.id = artwork_documents.artwork_id
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_artwork_documents_artwork_id ON artwork_documents(artwork_id);