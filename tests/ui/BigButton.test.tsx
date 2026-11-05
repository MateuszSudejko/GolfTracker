import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { BigButton } from '../../src/ui/BigButton';

test('renders label', async () => {
  await render(<BigButton label="Start" onPress={() => {}} />);
  expect(screen.getByText('Start')).toBeTruthy();
});

test('press calls onPress once', async () => {
  const onPress = jest.fn();
  await render(<BigButton label="Start" onPress={onPress} />);
  await fireEvent.press(screen.getByText('Start'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('disabled press does nothing', async () => {
  const onPress = jest.fn();
  await render(<BigButton label="Start" onPress={onPress} disabled />);
  await fireEvent.press(screen.getByText('Start'));
  expect(onPress).not.toHaveBeenCalled();
});

test('tap target at least 56 high', async () => {
  await render(<BigButton label="Start" onPress={() => {}} testID="btn" />);
  const style = StyleSheet.flatten(screen.getByTestId('btn').props.style);
  expect(style.minHeight).toBeGreaterThanOrEqual(56);
});
