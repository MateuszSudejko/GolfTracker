import { fireEvent, render, screen } from '@testing-library/react-native';
import { ValidationError } from '../../src/domain/names';
import { EditableItem, EditableList } from '../../src/ui/EditableList';

const items: EditableItem[] = [
  { id: 1, name: 'Driver', active: true },
  { id: 2, name: 'PW', active: true },
  { id: 3, name: 'LW', active: false },
];

function handlers() {
  return {
    onAdd: jest.fn().mockResolvedValue(undefined),
    onRename: jest.fn().mockResolvedValue(undefined),
    onToggleActive: jest.fn().mockResolvedValue(undefined),
    onMove: jest.fn().mockResolvedValue(undefined),
  };
}

test('add calls onAdd and clears input', async () => {
  const h = handlers();
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.changeText(screen.getByPlaceholderText('New club'), 'Mini Driver');
  await fireEvent.press(screen.getByText('Add'));
  expect(h.onAdd).toHaveBeenCalledWith('Mini Driver');
  expect(screen.getByPlaceholderText('New club').props.value).toBe('');
});

test('validation error message shown', async () => {
  const h = handlers();
  h.onAdd.mockRejectedValue(new ValidationError('A club with that name already exists'));
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.changeText(screen.getByPlaceholderText('New club'), 'pw');
  await fireEvent.press(screen.getByText('Add'));
  expect(await screen.findByText('A club with that name already exists')).toBeTruthy();
});

test('unexpected error shows generic message', async () => {
  const h = handlers();
  h.onAdd.mockRejectedValue(new Error('x'));
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.changeText(screen.getByPlaceholderText('New club'), 'abc');
  await fireEvent.press(screen.getByText('Add'));
  expect(await screen.findByText('Something went wrong')).toBeTruthy();
});

test('hidden item listed under Hidden and Show restores it', async () => {
  const h = handlers();
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  expect(screen.getByText('Hidden')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('toggle-3'));
  expect(h.onToggleActive).toHaveBeenCalledWith(3, true);
});

test('hide on active item calls toggle false', async () => {
  const h = handlers();
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.press(screen.getByTestId('toggle-1'));
  expect(h.onToggleActive).toHaveBeenCalledWith(1, false);
});

test('rename saves edited name', async () => {
  const h = handlers();
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.press(screen.getByText('PW'));
  await fireEvent.changeText(screen.getByTestId('rename-2'), 'Pitching Wedge');
  await fireEvent(screen.getByTestId('rename-2'), 'submitEditing');
  expect(h.onRename).toHaveBeenCalledWith(2, 'Pitching Wedge');
});

test('move down calls onMove', async () => {
  const h = handlers();
  await render(<EditableList items={items} addPlaceholder="New club" {...h} />);
  await fireEvent.press(screen.getByTestId('down-1'));
  expect(h.onMove).toHaveBeenCalledWith(1, 'down');
});
