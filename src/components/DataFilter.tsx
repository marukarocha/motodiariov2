'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface DateFilterProps {
  onDateSelected: (startDate: Date | null, endDate: Date | null) => void;
}

export function DateFilter({ onDateSelected }: DateFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const handleDateChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onDateSelected(range?.from, range?.to); // Pass the Date objects directly
  };

  const handleToday = () => {
    const today = new Date();
    onDateSelected(today, today);
  };

  const handleLast7Days = () => {
    const today = new Date();
    const start = subDays(today, 6);
    onDateSelected(start, today);
  };

  const handleLast15Days = () => {
    const today = new Date();
    const start = subDays(today, 14);
    onDateSelected(start, today);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    onDateSelected(start, end);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selectedRange?.from && "text-muted-foreground"
          )}
        >
          {selectedRange?.from && selectedRange?.to ? (
            `${format(selectedRange.from, 'dd/MM/yyyy', {
              locale: ptBR,
            })} - ${format(selectedRange.to, 'dd/MM/yyyy', {
              locale: ptBR,
            })}`
          ) : (
            'Selecione um intervalo de datas'
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background" align="start">
        <div className="bg-background p-4 rounded-lg flex flex-col">
          <div className="flex justify-around pb-2">
            <Button variant="outline" size="sm" onClick={handleToday}>Hoje</Button>
            <Button variant="outline" size="sm" onClick={handleLast7Days}>Últimos 7 dias</Button>
            <Button variant="outline" size="sm" onClick={handleLast15Days}>Últimos 15 dias</Button>
            <Button variant="outline" size="sm" onClick={handleThisMonth}>Este mês</Button>
          </div>
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleDateChange}
            locale={ptBR}
            showOutsideDays
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
