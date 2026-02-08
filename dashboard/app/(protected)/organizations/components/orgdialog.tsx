import React, { useState } from 'react'
import OrganizationService from '../service/organization.service';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';
import { ValidatorFactory } from '@/lib/utils/form/validatorfactory';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import Button from '@/components/app/button';
import { FormField } from '@/components/app/form/input';

const OrgDialog = ({ open, setOpen, onSuccess }: { open: boolean, setOpen: (open: boolean) => void, onSuccess: () => void }) => {

    const orgService = new OrganizationService();
    const form = useValidatedForm({
        initialData: {
            name: '',
        },
        validators: {
            name: ValidatorFactory.required('Organization name is required'),
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        await orgService.create(values, {
            onLoading: form.setSubmitting,
            onSuccess: (data) => {
                toast.success(`Organization created successfully!`);
                setOpen(false);
                form.reset();
                onSuccess();
            },
            onError: (message) => {
                toast.error(message);
            },
        });
    });
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='p-4'>
                <DialogHeader className='gap-0'>
                    <DialogTitle className='text-lg'>Create Organization</DialogTitle>
                    <DialogDescription className='text-sm'>
                        Create a new organization
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className=''>
                    <FieldGroup>
                        <FormField
                            id="name"
                            label="Organization Name"
                            name="name"
                            placeholder="Acme Corp"
                            required
                            form={form}
                        />
                    </FieldGroup>
                </form>
                <DialogFooter>
                    <Button size={"md"} variant={"outline"} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button className='min-w-32' size={"md"} loading={form.isSubmitting} onClick={onSubmit}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default OrgDialog