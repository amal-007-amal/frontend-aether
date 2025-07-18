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
import { ConfirmDialog } from "../../components/aetherconfirmpopup";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import { aetherFormaISOLocaltDate, aetherFormatDate } from "../../hooks/useFormattedDate";

export default function UserManagmentPage() {
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<Record<string, any>>({});
    const [sortedUsers, setSortedUsers] = useState<User[]>([]);
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

    const { fetchDeviceStatus } = useDeviceStatus()

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (users?.length) {
            const sorted = [...users].sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
            setSortedUsers(sorted);
        }
    }, [users]);

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

    const handleDeviceStatus = async (deviceId: string, userId: string) => {
        const status = await fetchDeviceStatus(deviceId);
        if (status) {
            setDeviceStatus(prev => ({ ...prev, [userId]: status }));
            setOpenRowId(userId);
        }
    };
    return (
        <div>
            <div className="p-2 bg-white mb-4  h-14 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex justify-between mb-2 items-center px-1 pt-2">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Users className="h-4 text-fuchsia-500" />User List</h2>
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
            </div>
            <div className="p-2 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <Table >
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-medium">Sl No.</TableHead>
                            <TableHead className="text-xs font-medium">Name</TableHead>
                            <TableHead className="text-xs font-medium">Phone Number</TableHead>
                            <TableHead className="text-xs font-medium">Agent Device id</TableHead>
                            <TableHead className="text-xs font-medium">Console Access</TableHead>
                            <TableHead className="text-xs font-medium">Agent Access</TableHead>
                            <TableHead className="text-xs font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedUsers.map((user, index) => (
                            <TableRow key={user.id} className="text-xs">
                                <TableCell className="text-left">{index + 1}</TableCell>
                                <TableCell className="text-left">{user.name}</TableCell>
                                <TableCell className="text-left">{user.phone_number}</TableCell>
                                <TableCell className="text-left cursor-pointer">
                                    <DropdownMenu
                                        open={openRowId === user.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                handleDeviceStatus(user.latest_agent_device_id, user.id);
                                            } else {
                                                setOpenRowId(null);
                                            }
                                        }}
                                    >
                                        <DropdownMenuTrigger>
                                            {user.latest_agent_device_id}
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent className="space-y-2 p-3 me-10 w-[25rem] text-xs ove">
                                            <div className="space-y-1">
                                                {deviceStatus[user.id] &&
                                                    <>
                                                        {Object.entries(deviceStatus[user.id]).map(([key, value]) => {
                                                            if (key === "current_recording_folder_uri") {
                                                                return (
                                                                    <div key={key} className="flex justify-between border-b py-1">
                                                                        <span className="capitalize">Recording Path:</span>
                                                                        <span className="overflow-x-auto">{decodeURIComponent(String(value))}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            if (key.toLowerCase().includes("timestamp")) {
                                                                return (
                                                                    <div key={key} className="flex justify-between border-b py-1">
                                                                        <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                                                                        <span>{aetherFormaISOLocaltDate(String(value))}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            if (key === "created_at") {
                                                                return (
                                                                    <div key={key} className="flex justify-between border-b py-1">
                                                                        <span className="capitalize">Created at:</span>
                                                                        <span>{aetherFormatDate(String(value))}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={key} className="flex justify-between border-b py-1">
                                                                    <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                                                                    <span>{String(value)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                }
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleDeviceStatus(user.latest_agent_device_id, user.id)}>
                                                    Refresh
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setOpenRowId(null)}>
                                                    Close
                                                </Button>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                                <TableCell className="text-left">{user.has_console_access ? 'Granted' : ''}</TableCell>
                                <TableCell className="text-left">{user.has_agent_access ? 'Granted' : ''}</TableCell>
                                <TableCell className="text-left flex items-center gap-2">
                                    <Button className="rounded-full shadow-none h-3 w-3 border-none" onClick={() => handleEdit(user)} variant="outline" size="sm">
                                        <Pencil className="w-3 h-3" />
                                    </Button>
                                    <ConfirmDialog
                                        title="Are you sure?"
                                        description="This will permanently delete the user."
                                        confirmText="Confirm"
                                        cancelText="Cancel"
                                        onConfirm={() => handleRemoveUser(user.id)}
                                        trigger={<Trash className="w-3 h-3 text-red-400 cursor-pointer" />}
                                    />
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