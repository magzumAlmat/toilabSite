'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  TableSortLabel,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  fetchAllEntries,
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

// Отображаемые значения записи (для колонок, поиска и сортировки).
const entryName = (e) =>
  e.data?.name || e.data?.brand || e.data?.item_name || `#${e.id}`;
const entrySupplier = (e) => e.supplier?.fullName || e.supplier?.email || '';
const entryCreated = (e) =>
  e.createdAt || e.data?.created_at || e.data?.createdAt || null;

// Единая строка для поиска по всем полям записи.
function haystack(e) {
  return [
    resourceLabel(e.resourceType),
    e.resourceType,
    entryName(e),
    e.supplier?.fullName,
    e.supplier?.email,
    `#${e.id}`,
    e.id,
    formatDate(entryCreated(e)),
    JSON.stringify(e.data || {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function ModerationQueueView() {
  const [allItems, setAllItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created'); // 'name' | 'supplier' | 'created'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const c = await fetchCounts(statusFilter);
      setCounts(c);
      const items = await fetchAllEntries({
        type: typeFilter,
        status: statusFilter,
        counts: c,
      });
      setAllItems(items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'created' ? 'desc' : 'asc');
    }
  };

  // Поиск + сортировка — производные от загруженного списка (без запросов к API).
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = q ? allItems.filter((e) => haystack(e).includes(q)) : allItems;
    const dir = sortDir === 'asc' ? 1 : -1;
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'created') {
        const av = new Date(entryCreated(a) || 0).getTime() || 0;
        const bv = new Date(entryCreated(b) || 0).getTime() || 0;
        return dir * (av - bv);
      }
      const get = sortBy === 'supplier' ? entrySupplier : entryName;
      return dir * String(get(a)).localeCompare(String(get(b)), 'ru', { sensitivity: 'base', numeric: true });
    });
    return arr;
  }, [allItems, search, sortBy, sortDir]);

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
      setAllItems((prev) =>
        prev.filter(
          (e) =>
            !(e.id === selected.id && e.resourceType === selected.resourceType),
        ),
      );
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

  const totalCount = Object.values(counts).reduce((a, b) => a + Number(b || 0), 0);
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
            {(search || typeFilter !== 'all') && !loading
              ? ` · показано: ${visible.length}`
              : ''}
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

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          select
          label="Тип записи"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="all">Все типы ({totalCount})</MenuItem>
          {RESOURCE_TYPES.map((r) => (
            <MenuItem key={r.type} value={r.type}>
              {r.icon} {r.label}
              {counts[r.type] ? ` (${counts[r.type]})` : ''}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          placeholder="Поиск по всем полям…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

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
        ) : visible.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography>
              {search ? 'Ничего не найдено' : statusMeta.empty}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Тип</TableCell>
                  <TableCell sortDirection={sortBy === 'name' ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortDir : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Название
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === 'supplier' ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === 'supplier'}
                      direction={sortBy === 'supplier' ? sortDir : 'asc'}
                      onClick={() => handleSort('supplier')}
                    >
                      Поставщик
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === 'created' ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === 'created'}
                      direction={sortBy === 'created' ? sortDir : 'asc'}
                      onClick={() => handleSort('created')}
                    >
                      Создано
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((entry) => (
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
                    <TableCell>{entryName(entry)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.supplier?.fullName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.supplier?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(entryCreated(entry))}</TableCell>
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
