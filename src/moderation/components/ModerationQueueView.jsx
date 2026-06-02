'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  listPending,
  fetchCounts,
  approveEntry,
  rejectEntry,
} from '../api/moderation';
import { RESOURCE_TYPES, resourceLabel, resourceIcon } from '../resources';
import { formatDate } from '../utils/format';
import EntryDetailDialog from './EntryDetailDialog';

// Вкладки по статусу модерации.
const STATUSES = [
  { value: 'pending', label: 'На модерации', subtitle: 'Ожидают проверки', empty: 'Нет записей на модерацию 🎉' },
  { value: 'rejected', label: 'Отклонённые', subtitle: 'Отклонённых записей', empty: 'Нет отклонённых записей' },
  { value: 'approved', label: 'Одобренные', subtitle: 'Одобренных записей', empty: 'Нет одобренных записей' },
];

export default function ModerationQueueView() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [queue, c] = await Promise.all([
        listPending({ type: typeFilter, status: statusFilter }),
        fetchCounts(statusFilter),
      ]);
      setItems(queue.items);
      setTotal(queue.total);
      setCounts(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleModerate = async (action, reason) => {
    if (!selected) return;
    setBusy(true);
    try {
      if (action === 'approve') {
        await approveEntry(selected.resourceType, selected.id);
        setToast('Запись одобрена');
      } else {
        await rejectEntry(selected.resourceType, selected.id, reason);
        setToast('Запись отклонена');
      }
      // Убираем обработанную запись из списка и обновляем счётчики.
      setItems((prev) =>
        prev.filter(
          (e) =>
            !(e.id === selected.id && e.resourceType === selected.resourceType),
        ),
      );
      setTotal((t) => Math.max(0, t - 1));
      setCounts((prev) => ({
        ...prev,
        [selected.resourceType]: Math.max(
          0,
          (prev[selected.resourceType] || 1) - 1,
        ),
      }));
    } finally {
      setBusy(false);
    }
  };

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const statusMeta = STATUSES.find((s) => s.value === statusFilter) || STATUSES[0];

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Очередь модерации
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusMeta.subtitle}: {totalCount}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={load}
          disabled={loading}
        >
          Обновить
        </Button>
      </Stack>

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(e, v) => v && setStatusFilter(v)}
        size="small"
        color="primary"
        sx={{ mb: 2 }}
      >
        {STATUSES.map((s) => (
          <ToggleButton key={s.value} value={s.value}>
            {s.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <TextField
        select
        label="Тип записи"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 260 }}
      >
        <MenuItem value="all">Все типы ({totalCount})</MenuItem>
        {RESOURCE_TYPES.map((r) => (
          <MenuItem key={r.type} value={r.type}>
            {r.icon} {r.label}
            {counts[r.type] ? ` (${counts[r.type]})` : ''}
          </MenuItem>
        ))}
      </TextField>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography>{statusMeta.empty}</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Тип</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Создано</TableCell>
                  <TableCell align="right">Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((entry) => (
                  <TableRow
                    key={`${entry.resourceType}-${entry.id}`}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelected(entry)}
                  >
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${resourceIcon(entry.resourceType)} ${resourceLabel(entry.resourceType)}`}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {entry.data?.name || entry.data?.brand || `#${entry.id}`}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.supplier?.fullName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.supplier?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(entry);
                        }}
                      >
                        Проверить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <EntryDetailDialog
        entry={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onModerate={handleModerate}
        busy={busy}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
