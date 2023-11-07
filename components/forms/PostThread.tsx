'use client';

import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
import { useOrganization } from '@clerk/nextjs';

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

function PostThread({ userId }: { userId: string }){
const router = useRouter();
const pathname = usePathname();
const { organization } = useOrganization();
        
const form = useForm({
            resolver: zodResolver(ThreadValidation),
            defaultValues: {
                thread: '',
                accountId: userId,
            }
        })

const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
        text: values.thread,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname,
    });

    router.push('/')
}



    return (
        <Form {...form}>
        <form
         className="flex flex-col justify-start gap-10 mt-10 "
           onSubmit={form.handleSubmit(onSubmit)} 
          >
             <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className='flex flex-col  gap-3 w-full'>
                <FormLabel className='text-base-semibold text-light-2'>
                    Content
                </FormLabel>
                <FormControl>
                  <Textarea 
                  rows={15}
                  className='no-focus border border-dark-4 bg-dark-3 text-light-1'
                  {...field}
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
           <Button
                className='bg-primary-500'
                type="submit">
                    Post Thread
            </Button>
        </form>
        </Form>
    )
}

export default PostThread;