import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Loader, Pencil, Plus, Trash } from "lucide-react";
import { createUser, deleteUser, getUsers, updateUser } from "../../api/login";
import type { CreateUser, User } from "../../types/login";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

export default function UserManagmentPage() {

    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [userData, setUserData] = useState<CreateUser>({
        id: '',
        phone_number: "",
        name: "",
        has_console_access: false,
        has_agent_access: false,
        is_superuser: false,
    })
    const [isPass, setIsPass] = useState(false)

    const fetchUsers = useCallback(async () => {
        setIsPass(true);
        try {
            const data = await getUsers();
            setUsers([...data]);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setIsPass(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setIsEditMode(prev => !prev)
        setIsPass(true)
        try {
            setOpen(true)
            setUserData(prev => (
                {
                    ...prev,
                    id: user.id,
                    name: user.name,
                    phone_number: user.phone_number,
                    has_agent_access: user.has_agent_access,
                    has_console_access: user.has_console_access,
                    is_superuser: user.is_superuser
                }
            ))
        } catch (error) {

        } finally {
            setIsPass(false)
        }
    };

    const handleRemoveUser = async (userId:any) => {
        setIsPass(true)
        try {
           const deleteUserReponse =  await deleteUser(userId);
            console.log(deleteUserReponse)
            toast.success("User deleted successfully");
            await fetchUsers();
        } catch (err) {
            toast.error("Failed to delete user");
        } finally {
            setIsPass(false)
        }
    }   

    const handleChange = (field: keyof CreateUser, value: any) => {
        setUserData((prev) => ({ ...prev, [field]: value }))
    }

    const handleCreateUserSubmit = async () => {
        setIsPass(true)
        try {
            if (isEditMode) {
                const updateUserResponse = await updateUser(userData)
                console.log(updateUserResponse)
                await fetchUsers()
                toast.success("User updated")
            } else {
                const createUserResponse = await createUser(userData)
                console.log(createUserResponse)
                toast.success("User created")
                await fetchUsers()
            }

            setOpen(false)
        } catch (err) {
            toast.error("Failed to create user")
        } finally {
            setIsPass(false)
        }
    }



    return (
        <div className="p-2">
            <div className="flex justify-between mb-4 shadow p-2 items-center border-l-2 border-l-black">
                <h2 className="text-sm font-normal">User List</h2>
                <Button variant={'outline'} onClick={() => {
                    setUserData({
                        name: "",
                        phone_number: "",
                        has_console_access: false,
                        has_agent_access: false,
                        is_superuser: false
                    })
                    setOpen(prev => !prev);
                    setIsEditMode(false);
                }}>Add User <Plus /></Button>
            </div>
            <div className="shadow-md p-2">
                <Table >
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                            <TableHead className="text-xs font-semibold">Name</TableHead>
                            <TableHead className="text-xs font-semibold">Phone Number</TableHead>
                            <TableHead className="text-xs font-semibold">Agent Device id</TableHead>
                            <TableHead className="text-xs font-semibold">Console Access</TableHead>
                            <TableHead className="text-xs font-semibold">Agent Access</TableHead>
                            <TableHead className="text-xs font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.id} className="text-xs">
                                <TableCell className="text-left">{index + 1}</TableCell>
                                <TableCell className="text-left">{user.name}</TableCell>
                                <TableCell className="text-left">{user.phone_number}</TableCell>
                                <TableCell className="text-left">{user.latest_agent_device_id}</TableCell>
                                <TableCell className="text-left">{user.has_console_access ? 'Granted' : ''}</TableCell>
                                <TableCell className="text-left">{user.has_agent_access ? 'Granted' : ''}</TableCell>
                                <TableCell className="text-left flex items-center gap-2">
                                    <Button className="rounded-full h-8 w-8 bg-gray-400" onClick={() => handleEdit(user)} variant="outline" size="sm">
                                        <Pencil className="w-4 h-4 text-white" />
                                    </Button>
                                    <Button className="rounded-full h-8 w-8 bg-red-400" onClick={() => handleRemoveUser(user.id)} variant="outline" size="sm">
                                        <Trash className="w-4 h-4 text-white" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {isPass && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                    <Loader className="animate-spin w-6 h-6 text-purple-500" />
                </div>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={userData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                disabled={isEditMode}
                                id="phone"
                                className={`${isEditMode ? 'opactiy-50' : ''}`}
                                value={userData.phone_number}
                                onChange={(e) => handleChange("phone_number", e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={userData.has_console_access}
                                onCheckedChange={(val) =>
                                    handleChange("has_console_access", Boolean(val))
                                }
                                id="console"
                            />
                            <Label htmlFor="console">Has Console Access</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={userData.has_agent_access}
                                onCheckedChange={(val) =>
                                    handleChange("has_agent_access", Boolean(val))
                                }
                                id="agent"
                            />
                            <Label htmlFor="agent">Has Agent Access</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={userData.is_superuser}
                                onCheckedChange={(val) =>
                                    handleChange("is_superuser", Boolean(val))
                                }
                                id="super"
                            />
                            <Label htmlFor="super">Is Superuser</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUserSubmit}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}