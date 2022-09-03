import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import lotusFormatter from './lotusFormatter';

export default function mojoToCATLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return lotusFormatter(mojo, Unit.MOJO)
    .to(Unit.CAT)
    .toLocaleString(locale);
}
