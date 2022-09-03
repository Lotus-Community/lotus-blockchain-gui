import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import lotusFormatter from './lotusFormatter';

export default function mojoToLotusLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return lotusFormatter(mojo, Unit.MOJO)
    .to(Unit.LOTUS)
    .toLocaleString(locale);
}
