import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import lotusFormatter from './lotusFormatter';

export default function catToMojo(cat: string | number | BigNumber): BigNumber {
  return lotusFormatter(cat, Unit.CAT)
    .to(Unit.MOJO)
    .toBigNumber();
}