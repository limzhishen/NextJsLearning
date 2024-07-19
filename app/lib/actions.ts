'use server';
import {z} from 'zod'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error:"Please select a customer"
    }),
    amount: z.coerce.number().gt(0,{message:"Please enter an amount greater than $0."}),
    status: z.enum(['pending', 'paid'],{
        invalid_type_error:`Please select an invoice status`
    }),
    date: z.string(),
  });

//Create Invoice
const CreateInvoice =FormSchema.omit({id:true,date:true})
export async function createInvoice(prevState:State,formData:FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId:formData.get('customerId'),
        amount:formData.get('amount'),
        status:formData.get('status')
    });
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }
    const {customerId,amount,status}=validatedFields.data;
    const amountIncents=amount*100
    const date=new Date().toISOString().split('T')[0];
    try{
        await sql`Insert into invoices (customer_id,amount,status,date)
        VALUE (${customerId},${amountIncents},${status},${date})`;
    }
    catch(e){
        return{
            message:'Database Error:Failed to Create Invoice'
        }
    }
    

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

//Update Invoice use zod
const UpdateInvoice=FormSchema.omit({id:true,date:true})

export async function updateInvoice(id:string,prevState:State,formData:FormData) {
    const validateField=UpdateInvoice.safeParse({
        customer_id:formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    if (!validateField.success) {
        return {
          errors: validateField.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Update Invoice.',
        };
      }
    const {customerId,amount,status}=validateField.data
    const amountIncents=amount*100
    try{
        await sql`Update invoices 
        SET customer_id = ${customerId}, amount = ${amountIncents}, status = ${status}
        WHERE id = ${id}
    `;
    }catch(error){
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

//DeleteInvoice
export async function deleteInvoice(id: string) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return { message: 'Deleted Invoice.' };
    } catch (error) {
      return { message: 'Database Error: Failed to Delete Invoice.' };
    }
  }

//improving accessbility
export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

//login
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}