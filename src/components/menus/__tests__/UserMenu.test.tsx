import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import UserMenu from 'components/menus/UserMenu';
import { customRender } from 'test/test-utils';

describe.skip('When there is user metadata', () => {
    const openMenu = async (user: UserEvent) => {
        await user.click(
            screen.getByLabelText<HTMLImageElement>('Open account menu')
        );
    };

    let username: string;

    beforeEach(() => {
        username = 'alice';
    });

    describe('the menu displays', () => {
        test('full name', async () => {
            const { user } = await customRender(<UserMenu iconColor="red" />, {
                username,
            });

            await waitFor(async () => {
                await openMenu(user);
                expect(
                    screen.getByText(`Full ${username}`)
                ).toBeInTheDocument();
            });
        });

        test('email', async () => {
            const { user } = await customRender(<UserMenu iconColor="red" />, {
                username,
            });

            await waitFor(async () => {
                await openMenu(user);
                expect(
                    screen.getByText(`${username}@example.org`)
                ).toBeInTheDocument();
            });
        });
    });

    test('the menu should render', async () => {
        const { user, view } = await customRender(
            <UserMenu iconColor="red" />,
            {
                username,
            }
        );

        await openMenu(user);
        expect(view).toMatchSnapshot();
    });
});
