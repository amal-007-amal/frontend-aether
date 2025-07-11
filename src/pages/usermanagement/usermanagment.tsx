import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { DownloadCloud, Menu, Pencil, RefreshCcw, Trash, UserRoundPlus, Users } from "lucide-react";
import { createUser, deleteUser, updateUser } from "../../api/login";
import type { CreateUser, User } from "../../types/login";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import AetherLoader from "../../shared/AetherLoader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { useUsers } from "../../hooks/useUsers";

export default function UserManagmentPage() {
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

    const { users, fetchUsers, isLoading } = useUsers()

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setIsEditMode(true);
        setIsPass(true);
        try {
            setOpen(true);
            setUserData({
                id: user.id,
                name: user.name,
                phone_number: user.phone_number,
                has_agent_access: user.has_agent_access,
                has_console_access: user.has_console_access,
                is_superuser: user.is_superuser
            });
        } catch (error) {
            // You can handle the error if needed
        } finally {
            setIsPass(false);
        }
    };

    const handleRemoveUser = async (userId: any) => {
        setIsPass(true)
        try {
            const deleteUserReponse = await deleteUser(userId);
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
                setOpen(false)
            } else {
                if (userData.phone_number !== "") {
                    const createUserResponse = await createUser(userData)
                    console.log(createUserResponse)
                    toast.success("User created")
                    await fetchUsers()
                    setOpen(false)
                } else {
                    toast.warning("Enter Valid Phone number!")
                }
            }
        } catch (err) {
            toast.error("Failed to create user")
        } finally {
            setIsPass(false)
        }
    }



    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200 dark:border-stone-700">
                <div className="flex justify-between mb-2 items-center px-1">
                    <h2 className="text-sm font-medium flex items-center"><Users className="h-4" />User List</h2>
                    <div className="flex justify-between items-center gap-3">
                        <UserRoundPlus onClick={() => {
                            setUserData({
                                name: "",
                                phone_number: "",
                                has_console_access: false,
                                has_agent_access: false,
                                is_superuser: false
                            })
                            setOpen(prev => !prev);
                            setIsEditMode(false);
                        }} className="h-4 w-4 cursor-pointer" />
                        <RefreshCcw onClick={fetchUsers} className={`h-4 w-4 cursor-pointer ${isLoading ? 'animate-spin' : ''}`} />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Menu className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <span className="text-xs flex gap-3 cursor-pointer"><DownloadCloud className="w-4 h-4" /> Import from CSV</span>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
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
                                    <Button className="rounded-full shadow-none h-3 w-3 border-none" onClick={() => handleEdit(user)} variant="outline" size="sm">
                                        <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button className="rounded-full border-none shadow-none h-3 w-3" onClick={() => handleRemoveUser(user.id)} variant="outline" size="sm">
                                        <Trash className="w-3 h-3 text-red-400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {isPass || isLoading && (
                <AetherLoader />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Update' : 'Create New'} User</DialogTitle>
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
                                type="number"
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
                        <Button className="bg-fuchsia-500" onClick={handleCreateUserSubmit}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}