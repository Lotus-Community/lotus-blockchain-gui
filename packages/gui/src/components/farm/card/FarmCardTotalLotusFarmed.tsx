import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useCurrencyCode, mojoToLotusLocaleString, CardSimple, useLocale } from '@lotus/core';
import { useGetFarmedAmountQuery } from '@lotus/api-react';

export default function FarmCardTotalLotusFarmed() {
  const currencyCode = useCurrencyCode();
  const [locale] = useLocale();
  const { data, isLoading, error } = useGetFarmedAmountQuery();

  const farmedAmount = data?.farmedAmount;

  const totalLotusFarmed = useMemo(() => {
    if (farmedAmount !== undefined) {
      return (
        <>
          {mojoToLotusLocaleString(farmedAmount, locale)}
          &nbsp;
          {currencyCode}
        </>
      );
    }
  }, [farmedAmount, locale, currencyCode]);

  return (
    <CardSimple
      title={<Trans>Total Lotus Farmed</Trans>}
      value={totalLotusFarmed}
      loading={isLoading}
      error={error}
    />
  );
}
