import React from 'react';

import {render} from '../../../../../jest/test-utils';
import {mockResult} from '../../../../../jest/fixtures/benchmark';

import {BenchResultCard} from '../BenchResultCard';

import {formatNumber} from '../../../../utils';

describe('BenchResultCard', () => {
  it('renders benchmark results correctly', () => {
    const {getByText} = render(
      <BenchResultCard
        result={mockResult}
        onDelete={() => {}}
        onShare={() => Promise.resolve()}
      />,
    );

    expect(getByText(mockResult.modelName)).toBeDefined();
    expect(getByText(`${mockResult.ppAvg.toFixed(2)} t/s`)).toBeDefined();
    expect(getByText(`${mockResult.tgAvg.toFixed(2)} t/s`)).toBeDefined();
  });

  it('shows standard deviations', () => {
    const {getByText} = render(
      <BenchResultCard
        result={mockResult}
        onDelete={() => {}}
        onShare={() => Promise.resolve()}
      />,
    );

    expect(getByText(`±${mockResult.ppStd.toFixed(2)}`)).toBeDefined();
    expect(getByText(`±${mockResult.tgStd.toFixed(2)}`)).toBeDefined();
  });

  it('displays model parameters and size', () => {
    const {getByText} = render(
      <BenchResultCard
        result={mockResult}
        onDelete={() => {}}
        onShare={() => Promise.resolve()}
      />,
    );

    expect(
      getByText(formatNumber(mockResult.modelNParams, 2, true, false), {
        exact: false,
      }),
    ).toBeDefined();
  });
});
