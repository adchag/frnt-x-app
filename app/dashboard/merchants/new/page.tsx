import { Metadata } from 'next'
import { createMerchantMandate } from '@/app/services/merchant.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Create Merchant Mandate',
  description: 'Create a new merchant banking mandate',
}

const CreateMerchantMandatePage = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server'
    const company_name = formData.get('company_name') as string
    const logo_url = formData.get('logo_url') as string
    const description = formData.get('description') as string

    await createMerchantMandate({
      company_name,
      logo_url,
      description,
    })

    // Redirect to the merchants list page after creation
    // You might want to use a client component for this action to handle the redirect on the client side
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create Merchant Mandate</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <Input type="text" id="company_name" name="company_name" required />
        </div>
        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <Input type="url" id="logo_url" name="logo_url" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea id="description" name="description" rows={4} />
        </div>
        <Button type="submit">Create Mandate</Button>
      </form>
    </div>
  )
}

export default CreateMerchantMandatePage