const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'aleck',
        username: 'aleckshen',
        password: 'shen'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('login')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel('username').fill('aleckshen')
      await page.getByLabel('password').fill('shen')

      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('aleck logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByLabel('username').fill('wrong')
      await page.getByLabel('password').fill('wrong')

      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })

    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await page.getByLabel('username').fill('aleckshen')
        await page.getByLabel('password').fill('shen')

        await page.getByRole('button', { name: 'login' }).click()
      })

      test('a new blog can be created', async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()

        await page.getByLabel('title:').fill('test blog')
        await page.getByLabel('author:').fill('tester')
        await page.getByLabel('url:').fill('test.com')

        await page.getByRole('button', { name: 'create' }).click()

        await expect(page.getByText('blog created successfully')).toBeVisible()
      })

      describe('When blog created', () => {
        beforeEach(async ({ page }) => {
          await page.getByRole('button', { name: 'create new blog' }).click()

          await page.getByLabel('title:').fill('test blog')
          await page.getByLabel('author:').fill('tester')
          await page.getByLabel('url:').fill('test.com')

          await page.getByRole('button', { name: 'create' }).click()
        })

        test('Blog can be liked', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          await page.getByRole('button', { name: 'like' }).click()

          await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('Blog can be deleted', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          await page.getByRole('button', { name: 'remove' }).click()

          await expect(page.locator('.blog')).toHaveCount(0)
        })
      })
    })
  })
})
