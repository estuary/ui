import '@testing-library/jest-dom';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import UserMenu from 'components/menus/UserMenu';
import { act, customRender, screen, waitFor } from 'utils/test-utils';

describe('When there is user metadata', () => {
    const openMenu = async (user: UserEvent) => {
        await user.click(
            screen.getByLabelText<HTMLImageElement>('Open Account Menu')
        );
    };

    let username: string;

    beforeEach(() => {
        username = 'foo123';
    });

    describe('the menu displays', () => {
        test('full name', async () => {
            const { user } = await customRender(
                <UserMenu iconColor="black" />,
                {
                    username,
                }
            );

            await act(async () => {
                await openMenu(user);
            });

            await waitFor(async () => {
                expect(
                    screen.getByText(`Full ${username}`)
                ).toBeInTheDocument();
            });
        });

        test('email', async () => {
            const { user } = await customRender(
                <UserMenu iconColor="black" />,
                {
                    username,
                }
            );

            await act(async () => {
                await openMenu(user);
            });

            await waitFor(async () => {
                expect(
                    screen.getByText(`${username}@example.org`)
                ).toBeInTheDocument();
            });
        });
    });
});
