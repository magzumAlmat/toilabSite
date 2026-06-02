import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7b1fa2' }, // фирменный фиолетовый Toilab
    secondary: { main: '#00897b' },
    background: { default: '#f5f6fa' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});

export default theme;
