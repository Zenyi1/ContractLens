import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadForm from '../UploadForm';

describe('UploadForm', () => {
  test('renders file inputs and submit button', () => {
    render(<UploadForm />);
    
    // Check for file inputs
    expect(screen.getByLabelText(/seller's t&cs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/buyer's t&cs/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /process documents/i })).toBeInTheDocument();
  });

  test('shows error when submitting without files', () => {
    render(<UploadForm />);
    
    // Click submit without selecting files
    fireEvent.click(screen.getByRole('button', { name: /process documents/i }));
    
    // Check for error message
    expect(screen.getByText(/please select both files/i)).toBeInTheDocument();
  });
}); 