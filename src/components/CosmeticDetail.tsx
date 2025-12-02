import React from 'react';
import { useParams } from 'react-router-dom';

export const CosmeticDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h2>Cosmetic Detail Page</h2>
      <p>Showing details for item ID: {id}</p>
    </div>
  );
};