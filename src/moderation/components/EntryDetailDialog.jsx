'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StatusChip from './StatusChip';
import { resourceLabel, resourceIcon } from '../resources';
import { fieldLabel, formatValue, formatDate } from '../utils/format';

// Диалог подробного просмотра записи. onModerate(action, reason) вызывается
// при одобрении/отклонении; кнопки блокируются на время запроса (busy).
export default function EntryDetailDialog({ entry, open, onClose, onModerate, busy }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!entry) return null;

  const handleClose = () => {
    setRejecting(false);
    setReason('');
    setError('');
    onClose();
  };

  const handleApprove = async () => {
    setError('');
    try {
      await onModerate('approve');
      handleClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Укажите причину отклонения');
      return;
    }
    setError('');
    try {
      await onModerate('reject', reason.trim());
      handleClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const dataEntries = Object.entries(entry.data || {});

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span style={{ fontSize: 22 }}>{resourceIcon(entry.resourceType)}</span>
          <span>{resourceLabel(entry.resourceType)}</span>
          <Box sx={{ flexGrow: 1 }} />
          <StatusChip status={entry.status} />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Поставщик
        </Typography>
        <Typography variant="body2">
          {entry.supplier?.fullName || '—'} · {entry.supplier?.email || '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Создано: {formatDate(entry.createdAt)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Данные записи
        </Typography>
        <Table size="small">
          <TableBody>
            {dataEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>Нет данных</TableCell>
              </TableRow>
            ) : (
              dataEntries.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell
                    sx={{ fontWeight: 600, width: '40%', verticalAlign: 'top' }}
                  >
                    {fieldLabel(key)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    {formatValue(value)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {entry.status === 'rejected' && entry.rejectionReason && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Причина отклонения: {entry.rejectionReason}
          </Alert>
        )}

        {rejecting && (
          <TextField
            label="Причина отклонения"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            autoFocus
            sx={{ mt: 2 }}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {rejecting ? (
          <>
            <Button onClick={() => setRejecting(false)} disabled={busy}>
              Назад
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleReject}
              disabled={busy}
              startIcon={<CancelIcon />}
            >
              Подтвердить отклонение
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={busy}>
              Закрыть
            </Button>
            {entry.status !== 'rejected' && (
              <Button
                color="error"
                onClick={() => setRejecting(true)}
                disabled={busy}
                startIcon={<CancelIcon />}
              >
                Отклонить
              </Button>
            )}
            {entry.status !== 'approved' && (
              <Button
                color="success"
                variant="contained"
                onClick={handleApprove}
                disabled={busy}
                startIcon={<CheckCircleIcon />}
              >
                Одобрить
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
