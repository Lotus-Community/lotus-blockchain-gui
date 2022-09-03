import { createApi } from '@reduxjs/toolkit/query/react';
import lotusLazyBaseQuery from './lotusLazyBaseQuery';

export const baseQuery = lotusLazyBaseQuery({});

export default createApi({
  reducerPath: 'lotusApi',
  baseQuery,
  endpoints: () => ({}),
});
