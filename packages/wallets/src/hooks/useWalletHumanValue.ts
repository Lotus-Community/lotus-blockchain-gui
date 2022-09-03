import { useMemo } from 'react';
import type { Wallet } from '@lotus/api';
import { WalletType } from '@lotus/api';
import BigNumber from 'bignumber.js';
import { mojoToCATLocaleString, mojoToLotusLocaleString, useLocale } from '@lotus/core';

export default function useWalletHumanValue(wallet: Wallet, value?: string | number | BigNumber, unit?: string): string {
  const [locale] = useLocale();
  
  return useMemo(() => {
    if (wallet && value !== undefined) {
      const localisedValue = wallet.type === WalletType.CAT
        ? mojoToCATLocaleString(value, locale)
        : mojoToLotusLocaleString(value, locale);

      return `${localisedValue} ${unit}`;
    }

    return '';
  }, [wallet, value, unit, locale]);
}
